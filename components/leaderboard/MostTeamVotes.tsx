"use client";
import useSWR from "swr";
import { teamMeta } from "app/utils/teamMeta";

export default function MostTeamVotes() {
  const { data, error } = useSWR("/api/leaderboard", (url) =>
    fetch(url).then((res) => res.json())
  );

  if (error) return <div>Error loading team votes</div>;
  if (!data) return <div>Loading...</div>;

  const { mostTeamVotes } = data;
  const meta = teamMeta[mostTeamVotes.slug];
  const backgroundColor = meta?.colors.primary || "#EEE";
  const nickname = meta?.nickname || mostTeamVotes.name;

  return (
    <div
      className="p-4 rounded shadow text-black"
      style={{ backgroundColor }}
    >
      <h2 className="font-bold text-lg mb-2">Most Total Team Votes</h2>
      <p>
        {nickname} ({mostTeamVotes.totalVotes} votes)
      </p>
    </div>
  );
}
