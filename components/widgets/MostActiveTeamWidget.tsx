"use client";
import useSWR from "swr";
import { useTeamMetaColors } from "@/components/useTeamMetaColors";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

type TeamActivityStat = { id: string; name: string; nickname: string; slug?: string | null; avgVotesPerDay: number };
type LeaderboardResponse = { mostActiveTeam: TeamActivityStat | null };

export default function MostActiveTeamWidget() {
  const { data, error } = useSWR<LeaderboardResponse>("/api/leaderboard", fetcher);

  if (error) return <div className="rounded p-4 bg-red-50 text-red-700">Error loading leaderboard.</div>;
  if (!data) return <div className="rounded p-4 bg-gray-50 text-gray-700">Loading…</div>;

  const team = data.mostActiveTeam;
  if (!team) {
    return (
      <div className="rounded p-4 bg-white border">
        <h3 className="text-lg font-bold mb-2">Most Active Team</h3>
        <p className="text-sm text-gray-600">No data yet.</p>
      </div>
    );
  }

  const { bg, text } = useTeamMetaColors(team.slug);
  const avg = Number.isFinite(team.avgVotesPerDay) ? team.avgVotesPerDay : 0;

  return (
    <div className="rounded p-4 shadow border" style={{ backgroundColor: bg, color: text, borderColor: "rgba(0,0,0,0.15)" }}>
      <h3 className="text-lg font-bold mb-2">Most Active Team</h3>
      <p className="text-xl">{team.nickname || team.name}</p>
      <p className="text-sm opacity-90">{avg.toFixed(2)} avg daily votes</p>
    </div>
  );
}
