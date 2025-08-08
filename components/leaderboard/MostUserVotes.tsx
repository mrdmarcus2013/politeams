"use client";
import useSWR from "swr";
import { teamMeta } from "app/utils/teamMeta";

export default function MostUserVotes() {
  const { data, error } = useSWR("/api/leaderboard", (url) =>
    fetch(url).then((res) => res.json())
  );

  if (error) return <div>Error loading user votes</div>;
  if (!data) return <div>Loading...</div>;

  const { mostUserVotes } = data;
  if (!mostUserVotes) return null;

  const meta = mostUserVotes.team
    ? teamMeta[mostUserVotes.team]
    : null;

  const bgColor = meta?.colors.primary || "#1F2937";
  const textColor = meta?.colors.textColor === "#FFFFFF" ? "#000000" : meta?.colors.textColor || "#FFFFFF";

  return (
    <div
      className="p-4 rounded shadow"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <h2 className="font-bold text-lg mb-2">Most User Votes</h2>
      <p>
        {mostUserVotes.name} ({mostUserVotes.totalVotes} total votes)
      </p>
    </div>
  );
}
