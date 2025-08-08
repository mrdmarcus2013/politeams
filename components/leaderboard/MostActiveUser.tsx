"use client";
import useSWR from "swr";
import { teamMeta } from "app/utils/teamMeta";

export default function MostActiveUser() {
  const { data, error } = useSWR("/api/leaderboard", (url) =>
    fetch(url).then((res) => res.json())
  );

  if (error) return <div>Error loading active user</div>;
  if (!data) return <div>Loading...</div>;

  const { mostActiveUser } = data;
  if (!mostActiveUser) return null;

  const meta = mostActiveUser.team
    ? teamMeta[mostActiveUser.team]
    : null;

  const bgColor = meta?.colors.primary || "#1F2937"; // default dark bg
  const textColor =
    meta?.colors.textColor === "#FFFFFF" ? "#000000" : meta?.colors.textColor || "#FFFFFF";

  return (
    <div
      className="p-4 rounded shadow"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <h2 className="font-bold text-lg mb-2">Most Active User This Week</h2>
      <p>
        {mostActiveUser.name} ({mostActiveUser.totalVotes} votes)
      </p>
    </div>
  );
}
