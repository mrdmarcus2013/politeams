"use client";

import { useState } from "react";

export default function Composer({
    onSubmit,
}: {
    onSubmit: (payload: { content: string; isAnonymous: boolean }) => void;
}) {
    const [content, setContent] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);

    return (
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
                    <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    Post anonymously
                </label>
                <button
                    onClick={() => {
                        if (!content.trim()) return;
                        onSubmit({ content: content.trim(), isAnonymous });
                        setContent("");
                        setIsAnonymous(false);
                    }}
                    disabled={!content.trim()}
                    className="px-3 py-1.5 rounded bg-blue-600 disabled:opacity-50"
                >
                    Post
                </button>
            </div>
        </div>
    );
}
