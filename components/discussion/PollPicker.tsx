"use client";

import { PollSummary } from "./types";

export default function PollPicker({
    polls,
    todaysPollId,
    selected,
    onSelect,
}: {
    polls: PollSummary[];
    todaysPollId: string | null;
    selected: string | null;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="rounded border border-gray-800 bg-black/40">
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-800">
                {polls.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">No polls found.</div>
                )}
                {polls.map((p) => {
                    const active = p.id === selected;
                    const today = p.id === todaysPollId;
                    return (
                        <button
                            key={p.id}
                            onClick={() => onSelect(p.id)}
                            className={`w-full text-left px-3 py-2 transition
                ${active ? "bg-pink-600/20 text-white" : "hover:bg-gray-900/40 text-gray-200"}`}
                            title={p.question}
                        >
                            <div className="text-sm font-medium flex items-center gap-2">
                                {today && <span className="text-xs text-cyan-400">Today</span>}
                                {p.question.length > 80 ? p.question.slice(0, 80) + "…" : p.question}
                            </div>
                            {p.createdAt && (
                                <div className="text-xs text-gray-500">
                                    {new Date(p.createdAt).toLocaleDateString()}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
