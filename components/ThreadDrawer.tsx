"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type CommentDTO = {
    id: string;
    content: string;
    isAnonymous: boolean;
    createdAt: string;
    likeCount: number;
    replyCount: number;
    user: { id: string | null; name: string | null; rank?: { title?: string | null } | null; team?: { slug?: string | null } | null } | null;
};

export default function ThreadDrawer({
    threadId,
    onClose,
}: {
    threadId: string | null;
    onClose: () => void;
}) {
    const { status } = useSession();
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<CommentDTO[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        if (!threadId) return;
        let aborted = false;
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await fetch(`/api/threads/${threadId}/comments`, { cache: "no-store" });
                if (!res.ok) throw new Error(`Load failed: ${res.status}`);
                const data = await res.json();
                if (!aborted) setComments(data.comments ?? []);
            } catch (e: any) {
                if (!aborted) setError(e?.message ?? "Failed to load");
            } finally {
                if (!aborted) setLoading(false);
            }
        })();
        return () => { aborted = true; };
    }, [threadId]);

    async function postComment() {
        if (!threadId || !content.trim()) return;
        const res = await fetch(`/api/threads/${threadId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, isAnonymous }),
        });
        if (!res.ok) { alert("Could not post"); return; }
        setContent("");
        // reload
        const next = await fetch(`/api/threads/${threadId}/comments`, { cache: "no-store" }).then(r => r.json());
        setComments(next.comments ?? []);
    }

    async function likeComment(id: string) {
        await fetch(`/api/comments/${id}/react`, { method: "POST" }); // idempotent on server
        setComments(cs => cs.map(c => c.id === id ? { ...c, likeCount: c.likeCount + 1 } : c));
    }

    const open = Boolean(threadId);
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            {/* panel */}
            <div className="ml-auto h-full w-full max-w-lg bg-black border-l border-gray-800 relative flex flex-col">
                <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                    <div className="font-semibold">Discussion</div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loading && <div className="text-sm text-gray-400">Loading…</div>}
                    {error && <div className="text-sm text-red-400">{error}</div>}
                    {!loading && !error && comments.length === 0 && (
                        <div className="text-sm text-gray-500">No comments yet.</div>
                    )}

                    {comments.map(c => (
                        <div key={c.id} className="rounded border border-gray-800 p-2 bg-black/60">
                            <div className="text-xs text-gray-400 mb-1">
                                {c.isAnonymous ? "Anonymous" : (c.user?.name ?? "Unknown")}
                                {c.user?.rank?.title ? ` • ${c.user.rank.title}` : ""}
                                {c.user?.team?.slug ? ` • ${c.user.team.slug}` : ""}
                                {" • "}{new Date(c.createdAt).toLocaleString()}
                            </div>
                            <div className="text-sm">{c.content}</div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                                <button onClick={() => likeComment(c.id)} className="hover:text-white">❤️ {c.likeCount}</button>
                                <span>↩︎ {c.replyCount}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* composer */}
                {status === "authenticated" && (
                    <div className="p-3 border-t border-gray-800">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={3}
                            placeholder="Write a comment…"
                            className="w-full rounded border border-gray-700 bg-black text-white p-2"
                            maxLength={2000}
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <label className="text-xs text-gray-400 flex items-center gap-2">
                                <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
                                Post anonymously
                            </label>
                            <button
                                onClick={postComment}
                                disabled={!content.trim()}
                                className="px-3 py-1.5 rounded bg-blue-600 disabled:opacity-50"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
