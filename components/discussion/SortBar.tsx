"use client";

import { SortKey } from "./types";

export default function SortBar({
    sort,
    onChange,
}: {
    sort: SortKey;
    onChange: (s: SortKey) => void;
}) {
    return (
        <div className="flex items-center">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Sort:</label>
                <select
                    value={sort}
                    onChange={(e) => onChange(e.target.value as SortKey)}
                    className="border rounded px-2 py-1 text-sm bg-black text-white border-gray-700"
                >
                    <option value="newest">Newest</option>
                    <option value="popular">Most Liked</option>
                    <option value="title">By Title</option>
                </select>
            </div>
        </div>
    );
}
