"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MostUserVotesWidget() {
  const { data, error } = useSWR("/api/leaderboard", fetcher);

  if (error) return <div>Error loading leaderboard.</div>;
  if (!data) return <div>Loading…</div>;

  const user = data.mostUserVotes;

  return (
    <div className="rounded p-4 bg-black text-white shadow border border-gray-700">
      <h3 className="text-lg font-bold mb-2">Most User Votes</h3>
      <p className="text-xl">{user.name}</p>
      <p className="text-sm text-gray-400">{user.totalVotes} total votes</p>
    </div>
  );
}
