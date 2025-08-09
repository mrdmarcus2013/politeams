"use client";

import { useEffect, useState } from "react";
import { CommentDTO } from "../types";
import CommentItem from "./CommentItem";
import Composer from "./Composer";

export default function ThreadDrawer({
    open,
    threadId,
    title,
    canPost,
    gatedMessage,
    onClose,
}: {
    open: boolean;
    threadId: string | null;
    title: string;
    canPost: boolean;
    gatedMessage?: string | null;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<CommentDTO[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !threadId) return;
        let aborted = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/threads/${threadId}/comments`, {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error(`Load failed: ${res.status}`);
                const data = (await res.json()) as { comments: CommentDTO[] };
                if (!aborted) setComments(data.comments ?? []);
            } catch (e: any) {
                if (!aborted) setError(e?.message ?? "Failed to load");
            } finally {
                if (!aborted) setLoading(false);
            }
        })();

        return () => {
            aborted = true;
        };
    }, [open, threadId]);

    async function postComment(payload: { content: string; isAnonymous: boolean }) {
        if (!threadId) return;
        const res = await fetch(`/api/threads/${threadId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            alert("Could not post comment.");
            return;
        }
        // reload
        const next = await fetch(`/api/threads/${threadId}/comments`, {
            cache: "no-store",
        }).then((r) => r.json());
        setComments(next.comments ?? []);
    }

    async function likeComment(id: string) {
        await fetch(`/api/comments/${id}/react`, { method: "POST" });
        setComments((cs) =>
            cs.map((c) => (c.id === id ? { ...c, likeCount: c.likeCount + 1 } : c))
        );
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            {/* Panel */}
            <div className="ml-auto h-full w-full max-w-lg bg-black border-l border-gray-800 relative flex flex-col">
                <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                    <div className="font-semibold text-white truncate pr-4" title={title}>
                        {title || "Discussion"}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {gatedMessage ? (
                    <div className="flex-1 grid place-items-center p-6 text-center text-yellow-200">
                        <div className="text-sm">{gatedMessage}</div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {loading && <div className="text-sm text-gray-400">Loading…</div>}
                            {error && <div className="text-sm text-red-400">{error}</div>}
                            {!loading && !error && comments.length === 0 && (
                                <div className="text-sm text-gray-500">No comments yet.</div>
                            )}

                            {comments.map((c) => (
                                <CommentItem key={c.id} comment={c} onLike={likeComment} />
                            ))}
                        </div>

                        {canPost && <Composer onSubmit={postComment} />}
                    </>
                )}
            </div>
        </div>
    );
}
