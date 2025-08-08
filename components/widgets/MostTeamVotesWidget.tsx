"use client";
import useSWR from "swr";
import { useTeamColors } from "components/TeamWrapper";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MostTeamVotesWidget() {
  const { data, error } = useSWR("/api/leaderboard", fetcher);
  const teamColors = useTeamColors();

  if (error) return <div>Error loading leaderboard.</div>;
  if (!data) return <div>Loading…</div>;

  const team = data.mostTeamVotes;
  const color = teamColors[team.nickname as keyof typeof teamColors]?.bg || "bg-pink-900";

  return (
    <div className={`rounded p-4 text-white shadow ${color}`}>
      <h3 className="text-lg font-bold mb-2">Most Team Votes</h3>
      <p className="text-xl">{team.nickname}</p>
      <p className="text-sm text-gray-200">{team.totalVotes} total votes</p>
    </div>
  );
}
