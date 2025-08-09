"use client";
import useSWR from "swr";
import { useTeamMetaColors } from "@/components/useTeamMetaColors";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

type TeamStat = { id: string; name: string; nickname: string; slug?: string | null; userCount: number };
type LeaderboardResponse = { mostPopularTeam: TeamStat | null };

export default function MostPopularTeamWidget() {
  const { data, error } = useSWR<LeaderboardResponse>("/api/leaderboard", fetcher);

  if (error) return <div className="rounded p-4 bg-red-50 text-red-700">Error loading leaderboard.</div>;
  if (!data) return <div className="rounded p-4 bg-gray-50 text-gray-700">Loading…</div>;

  const team = data.mostPopularTeam;
  if (!team) {
    return (
      <div className="rounded p-4 bg-white border">
        <h3 className="text-lg font-bold mb-2">Most Popular Team</h3>
        <p className="text-sm text-gray-600">No data yet.</p>
      </div>
    );
  }

  const { bg, text } = useTeamMetaColors(team.slug);

  return (
    <div className="rounded p-4 shadow border" style={{ backgroundColor: bg, color: text, borderColor: "rgba(0,0,0,0.15)" }}>
      <h3 className="text-lg font-bold mb-2">Most Popular Team</h3>
      <p className="text-xl">{team.nickname || team.name}</p>
      <p className="text-sm opacity-90">{team.userCount} users</p>
    </div>
  );
}
