"use client";
import useSWR from "swr";
import { teamMeta } from "app/utils/teamMeta";

export default function MostActiveTeam() {
    const { data, error } = useSWR("/api/leaderboard", (url) =>
        fetch(url).then((res) => res.json())
    );

    if (error) return <div>Error loading active team</div>;
    if (!data) return <div>Loading...</div>;

    const { mostActiveTeam } = data;
    if (!mostActiveTeam) return null;

    const meta = teamMeta[mostActiveTeam.slug];
    const backgroundColor = meta?.colors.primary || "#EEE";
    const nickname = meta?.nickname || mostActiveTeam.name;

    return (
        <div
            className="p-4 rounded shadow text-black"
            style={{ backgroundColor }}
        >
            <h2 className="font-bold text-lg mb-2">Most Active Team</h2>
            <p>
                {nickname} ({mostActiveTeam.avgVotesPerUser} votes per user)
            </p>
        </div>
    );
}
