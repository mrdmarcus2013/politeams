"use client";

import { ThreadDTO } from "./types";

export default function ThreadsList({
    threads,
    locked,
    loading,
    error,
    onOpen,
    showSelectPrompt,
}: {
    threads: ThreadDTO[];
    locked: boolean;
    loading: boolean;
    error: string | null;
    showSelectPrompt?: boolean;
    onOpen: (t: ThreadDTO) => void;
}) {
    return (
        <div className="rounded border border-gray-800 bg-black/40">
            <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                {locked && (
                    <div className="p-3 text-sm rounded border border-yellow-600/40 bg-yellow-600/10 text-yellow-200">
                        Vote on today’s poll to view and join the discussion.
                    </div>
                )}

                {!locked && loading && (
                    <div className="text-sm text-gray-400 p-2">Loading…</div>
                )}
                {!locked && error && (
                    <div className="text-sm text-red-400 p-2">{error}</div>
                )}
                {!locked && !loading && !error && threads.length === 0 && (
                    <div className="text-sm text-gray-400 p-2">
                        {showSelectPrompt ? "Select a poll to view its discussion." : "No threads yet."}
                    </div>
                )}

                {!locked &&
                    threads.map((th) => (
                        <button
                            key={th.id}
                            onClick={() => onOpen(th)}
                            className="w-full text-left rounded border border-gray-700 p-3 bg-black/60 hover:border-gray-600 transition"
                        >
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-white">{th.title}</div>
                                <div className="text-xs text-gray-500">
                                    {new Date(th.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="mt-1 text-sm text-gray-400 flex items-center gap-3">
                                <span>💬 {th.commentCount}</span>
                                <span>❤️ {th.likeCount}</span>
                                {th.type === "POLL" && !!th.pollId && (
                                    <span className="rounded bg-blue-50/10 text-blue-300 px-2 py-0.5 text-xs">
                                        Poll
                                    </span>
                                )}
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                                by {th.createdBy?.name ?? "Unknown"}
                                {th.createdBy?.team?.slug ? ` • ${th.createdBy.team.slug}` : ""}
                                {th.createdBy?.rank?.title ? ` • ${th.createdBy.rank.title}` : ""}
                            </div>
                        </button>
                    ))}
            </div>
        </div>
    );
}
