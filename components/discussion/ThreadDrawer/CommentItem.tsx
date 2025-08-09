"use client";

import { CommentDTO } from "../types";

export default function CommentItem({
    comment,
    onLike,
}: {
    comment: CommentDTO;
    onLike: (id: string) => void;
}) {
    return (
        <div className="rounded border border-gray-800 p-2 bg-black/60">
            <div className="text-xs text-gray-400 mb-1">
                {comment.isAnonymous ? "Anonymous" : comment.user?.name ?? "Unknown"}
                {comment.user?.rank?.title ? ` • ${comment.user.rank.title}` : ""}
                {comment.user?.team?.slug ? ` • ${comment.user.team.slug}` : ""}
                {" • "}
                {new Date(comment.createdAt).toLocaleString()}
            </div>
            <div className="text-sm text-white">{comment.content}</div>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                <button onClick={() => onLike(comment.id)} className="hover:text-white">
                    ❤️ {comment.likeCount}
                </button>
                <span>↩︎ {comment.replyCount}</span>
            </div>
        </div>
    );
}
