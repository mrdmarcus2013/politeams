"use client";
import useSWR from "swr";

type Badge = {
    id: number;
    name: string;
    icon: string;
    description: string;
    unlockHint: string;
    earnedAt: string;
};

const fetcher = (url: string) =>
    fetch(url, { cache: "no-store" }).then((r) => r.json());

export default function BadgeSection() {
    const { data, error, isLoading } = useSWR<{ badges: Badge[] }>(
        "/api/badges",
        fetcher,
        {
            revalidateOnFocus: true,      // refresh when tab refocuses
            revalidateOnReconnect: true,  // refresh on reconnect
        }
    );

    if (isLoading) {
        return <p className="text-sm text-gray-400">Loading badges...</p>;
    }
    if (error) {
        return <p className="text-sm text-red-400">Failed to load badges.</p>;
    }

    const badges = data?.badges ?? [];
    if (badges.length === 0) {
        return <p className="text-sm text-gray-400">No badges earned yet.</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className="bg-gray-900 rounded p-3 border border-gray-700 hover:border-white transition"
                >
                    <div className="text-3xl text-center">{badge.icon}</div>
                    <div className="mt-2 text-center">
                        <p className="font-bold text-pink-400">{badge.name}</p>
                        <p className="text-sm text-gray-300">{badge.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
