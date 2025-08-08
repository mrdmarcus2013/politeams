"use client";
import useSWR from "swr";
import { teamMeta } from "app/utils/teamMeta";

export default function MostPopularTeam() {
  const { data, error } = useSWR("/api/leaderboard", (url) =>
    fetch(url).then((res) => res.json())
  );

  if (error) return <div>Error loading popular team</div>;
  if (!data) return <div>Loading...</div>;

  const { mostPopularTeam } = data;
  const meta = teamMeta[mostPopularTeam.slug];
  const backgroundColor = meta?.colors.primary || "#EEE";
  const nickname = meta?.nickname || mostPopularTeam.name;

  return (
    <div
      className="p-4 rounded shadow text-black"
      style={{ backgroundColor }}
    >
      <h2 className="font-bold text-lg mb-2">Most Popular Team</h2>
      <p>
        {nickname} ({mostPopularTeam.userCount} users)
      </p>
    </div>
  );
}
