"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SortBar from "./SortBar";
import Tabs from "./Tabs";
import PollPicker from "./PollPicker";
import ThreadsList from "./ThreadsList";
import ThreadDrawer from "./ThreadDrawer/ThreadDrawer";
import type {
    ThreadDTO,
    ThreadType,
    SortKey,
    PollSummary,
} from "./types";

export default function DiscussionSection() {
    const { status } = useSession();

    const [activeType, setActiveType] = useState<ThreadType>("POLL");
    const [sort, setSort] = useState<SortKey>("newest");
    const [threads, setThreads] = useState<ThreadDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Poll list + selection (for Poll Discussions)
    const [polls, setPolls] = useState<PollSummary[]>([]);
    const [selectedPollId, setSelectedPollId] = useState<string | null>(null);

    // Today gating
    const [todaysPollId, setTodaysPollId] = useState<string | null>(null);
    const [hasVotedToday, setHasVotedToday] = useState<boolean>(false);

    // Drawer state
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [threadTitle, setThreadTitle] = useState<string>("");

    // Refetch key after voting
    const [refreshKey, setRefreshKey] = useState(0);

    /** Listen for "poll:voted" emitted by TodayPoll to unlock comments */
    useEffect(() => {
        function onVoted(e: Event) {
            const detail = (e as CustomEvent).detail as { pollId?: string };
            if (detail?.pollId && detail.pollId === todaysPollId) {
                setHasVotedToday(true);
                setRefreshKey((k) => k + 1);
            }
        }
        window.addEventListener("poll:voted", onVoted);
        return () => window.removeEventListener("poll:voted", onVoted);
    }, [todaysPollId]);

    /** Load poll list:
     *  - Fetch Today (id + userVoted for gating)
     *  - Fetch History (all polls, newest → oldest)
     *  - Ensure Today is pinned to the top
     *  - Default selection: Today → newest
     */
    useEffect(() => {
        if (activeType !== "POLL") return;

        let aborted = false;
        (async () => {
            try {
                const [todayRes, historyRes] = await Promise.all([
                    fetch("/api/polls/today", { cache: "no-store" }),
                    fetch("/api/polls/history?limit=500", { cache: "no-store" }),
                ]);

                const todayJson = todayRes.ok ? await todayRes.json() : null;
                const historyJson = historyRes.ok ? await historyRes.json() : null;

                const todayPoll = todayJson?.poll as (PollSummary & { userVoted?: boolean }) | null;
                const history = Array.isArray(historyJson?.polls)
                    ? (historyJson.polls as PollSummary[])
                    : [];

                // Pin Today on top if present; avoid duplication
                let merged = history;
                if (todayPoll) {
                    merged = [
                        { id: todayPoll.id, question: todayPoll.question, createdAt: todayPoll.createdAt },
                        ...history.filter((p) => p.id !== todayPoll.id),
                    ];
                }

                if (!aborted) {
                    setPolls(merged);
                    setTodaysPollId(todayPoll?.id ?? null);
                    setHasVotedToday(Boolean(todayPoll?.userVoted));
                    const defaultId = todayPoll?.id ?? (merged.length ? merged[0].id : null);
                    setSelectedPollId((cur) => cur ?? defaultId);
                }
            } catch {
                // ignore
            }
        })();

        return () => {
            aborted = true;
        };
    }, [activeType]);

    /** Load threads for the selected tab (gates today's poll if not voted) */
    useEffect(() => {
        let aborted = false;

        async function run() {
            setLoading(true);
            setError(null);
            try {
                const url = new URL("/api/threads", window.location.origin);
                url.searchParams.set("type", activeType);
                url.searchParams.set("sort", sort);
                if (activeType === "POLL" && selectedPollId) {
                    url.searchParams.set("pollId", selectedPollId);
                }

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

        const gatingToday =
            activeType === "POLL" &&
            selectedPollId &&
            todaysPollId &&
            selectedPollId === todaysPollId &&
            !hasVotedToday;

        if (gatingToday) {
            setThreads([]);
            setLoading(false);
            setError(null);
            return;
        }

        if (activeType !== "POLL" || selectedPollId) {
            run();
        } else {
            setThreads([]);
        }

        return () => {
            aborted = true;
        };
    }, [activeType, sort, selectedPollId, todaysPollId, hasVotedToday, refreshKey]);

    // Today gating helper
    const isSelectedTodayLocked =
        activeType === "POLL" &&
        selectedPollId &&
        todaysPollId &&
        selectedPollId === todaysPollId &&
        !hasVotedToday;

    return (
        <section className="space-y-4">
            <SortBar sort={sort} onChange={setSort} />
            <Tabs active={activeType} onChange={setActiveType} />

            {activeType === "POLL" && (
                <PollPicker
                    polls={polls}
                    todaysPollId={todaysPollId}
                    selected={selectedPollId}
                    onSelect={setSelectedPollId}
                />
            )}

            <ThreadsList
                threads={threads}
                locked={isSelectedTodayLocked}
                loading={loading}
                error={error}
                showSelectPrompt={activeType === "POLL" && !selectedPollId}
                onOpen={(t) => {
                    setActiveThreadId(t.id);
                    setThreadTitle(t.title);
                }}
            />

            <ThreadDrawer
                open={Boolean(activeThreadId) && !isSelectedTodayLocked}
                threadId={isSelectedTodayLocked ? null : activeThreadId}
                title={threadTitle}
                onClose={() => setActiveThreadId(null)}
                canPost={status === "authenticated" && !isSelectedTodayLocked}
                gatedMessage={
                    isSelectedTodayLocked
                        ? "Vote on today’s poll to view and join the discussion."
                        : null
                }
            />
        </section>
    );
}
