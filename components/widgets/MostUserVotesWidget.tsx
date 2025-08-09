"use client";
import useSWR from "swr";
import { useTeamMetaColors } from "@/components/useTeamMetaColors";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

type UserVotesStat = { id: string; name: string | null; teamSlug?: string | null; totalVotes: number };
type LeaderboardResponse = { mostUserVotes: UserVotesStat | null };

export default function MostUserVotesWidget() {
  const { data, error } = useSWR<LeaderboardResponse>("/api/leaderboard", fetcher);

  if (error) return <div className="rounded p-4 bg-red-50 text-red-700">Error loading leaderboard.</div>;
  if (!data) return <div className="rounded p-4 bg-gray-50 text-gray-700">Loading…</div>;

  const user = data.mostUserVotes;
  if (!user) {
    return (
      <div className="rounded p-4 bg-white border">
        <h3 className="text-lg font-bold mb-2">Most User Votes</h3>
        <p className="text-sm text-gray-600">No data yet.</p>
      </div>
    );
  }

  const { bg, text } = useTeamMetaColors(user.teamSlug);

  return (
    <div className="rounded p-4 shadow border" style={{ backgroundColor: bg, color: text, borderColor: "rgba(0,0,0,0.15)" }}>
      <h3 className="text-lg font-bold mb-2">Most User Votes</h3>
      <p className="text-xl">{user.name ?? "Anonymous"}</p>
      <p className="text-sm opacity-90">{Number(user.totalVotes) || 0} total votes</p>
    </div>
  );
}
