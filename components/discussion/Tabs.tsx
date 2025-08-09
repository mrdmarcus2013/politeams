"use client";

import { ThreadType } from "./types";

export default function Tabs({
    active,
    onChange,
}: {
    active: ThreadType;
    onChange: (t: ThreadType) => void;
}) {
    const tabs: { key: ThreadType; label: string }[] = [
        { key: "POLL", label: "Poll Discussions" },
        { key: "TOPIC", label: "User Topics" },
        { key: "FEEDBACK", label: "App Feedback" },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2">
            {tabs.map((t) => (
                <button
                    key={t.key}
                    onClick={() => onChange(t.key)}
                    className={`px-3 py-1.5 rounded-full border transition
            ${active === t.key
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-black text-gray-200 border-gray-700 hover:bg-gray-900"}`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}
