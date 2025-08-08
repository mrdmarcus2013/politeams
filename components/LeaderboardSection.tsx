"use client";

import { useEffect, useState } from "react";
import MostPopularTeam from "./leaderboard/MostPopularTeam";
import MostActiveTeam from "./leaderboard/MostActiveTeam";
import MostTeamVotes from "./leaderboard/MostTeamVotes";
import MostActiveUser from "./leaderboard/MostActiveUser";
import MostUserVotes from "./leaderboard/MostUserVotes";

type LeaderboardData = {
  mostPopularTeam: { name: string; count: number };
  mostActiveTeam: { name: string; average: number };
  mostTeamVotes: { name: string; count: number };
  mostActiveUser: { name: string; average: number };
  mostUserVotes: { name: string; count: number };
};

export default function LeaderboardSection() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      setData(json);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading leaderboard...</p>;
  if (!data) return <p>No leaderboard data available.</p>;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-white">🏆 Leaderboards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MostPopularTeam team={data.mostPopularTeam} />
        <MostActiveTeam team={data.mostActiveTeam} />
        <MostTeamVotes team={data.mostTeamVotes} />
        <MostActiveUser user={data.mostActiveUser} />
        <MostUserVotes user={data.mostUserVotes} />
      </div>
    </section>
  );
}