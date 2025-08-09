"use client";

import { useEffect, useMemo, useState } from "react";

type ThreadType = "POLL" | "TOPIC" | "FEEDBACK";
type SortKey = "newest" | "popular" | "title";

type ThreadDTO = {
    id: string;
    title: string;
    type: ThreadType;
    pollId?: string | null;
    commentCount: number;
    likeCount: number;
    createdAt: string;
    createdBy: {
        id: string;
        name: string | null;
        team?: { slug?: string | null } | null;
        rank?: { title?: string | null } | null;
    };
};

export default function DiscussionSection() {
    const [activeType, setActiveType] = useState<ThreadType>("POLL");
    const [sort, setSort] = useState<SortKey>("newest");
    const [threads, setThreads] = useState<ThreadDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const tabs: { key: ThreadType; label: string }[] = useMemo(
        () => [
            { key: "POLL", label: "Poll Discussions" },
            { key: "TOPIC", label: "User Topics" },
            { key: "FEEDBACK", label: "App Feedback" },
        ],
        []
    );

    useEffect(() => {
        let aborted = false;
        async function run() {
            setLoading(true);
            setError(null);
            try {
                const url = new URL("/api/threads", window.location.origin);
                url.searchParams.set("type", activeType);
                url.searchParams.set("sort", sort);

                const res = await fetch(url.toString(), { cache: "no-store" });
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                const data = (await res.json()) as { threads: ThreadDTO[] } | ThreadDTO[];
                const list = Array.isArray(data) ? data : data.threads;
                if (!aborted) setThreads(list ?? []);
            } catch (e: any) {
                if (!aborted) setError(e?.message ?? "Failed to load threads");
            } finally {
                if (!aborted) setLoading(false);
            }
        }
        run();
        return () => {
            aborted = true;
        };
    }, [activeType, sort]);

    return (
        <section className="mt-6">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveType(t.key)}
                        className={`px-3 py-1.5 rounded-full border transition
              ${activeType === t.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"}`}
                    >
                        {t.label}
                    </button>
                ))}

                {/* Sort control */}
                <div className="ml-auto flex items-center gap-2">
                    <label className="text-sm text-gray-600">Sort:</label>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        <option value="newest">Newest</option>
                        <option value="popular">Most Liked</option>
                        <option value="title">By Title</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="mt-4">
                {loading && <div className="text-sm text-gray-600">Loading…</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}
                {!loading && !error && threads.length === 0 && (
                    <div className="text-sm text-gray-600">No threads yet.</div>
                )}

                <ul className="space-y-3">
                    {threads.map((th) => (
                        <li key={th.id} className="border rounded p-3 bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{th.title}</h3>
                                <div className="text-xs text-gray-500">
                                    {new Date(th.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="mt-1 text-sm text-gray-600 flex items-center gap-3">
                                <span>💬 {th.commentCount}</span>
                                <span>❤️ {th.likeCount}</span>
                                {th.type === "POLL" && !!th.pollId && (
                                    <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-xs">
                                        Poll Thread
                                    </span>
                                )}
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                                by {th.createdBy?.name ?? "Unknown"}{" "}
                                {th.createdBy?.team?.slug ? `• ${th.createdBy.team.slug}` : ""}{" "}
                                {th.createdBy?.rank?.title ? `• ${th.createdBy.rank.title}` : ""}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
