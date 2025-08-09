"use client";

import MostPopularTeam from "./leaderboard/MostPopularTeam";
import MostActiveTeam from "./leaderboard/MostActiveTeam";
import MostTeamVotes from "./leaderboard/MostTeamVotes";
import MostActiveUser from "./leaderboard/MostActiveUser";
import MostUserVotes from "./leaderboard/MostUserVotes";

export default function LeaderboardSection() {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-white">🏆 Leaderboards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MostPopularTeam />
        <MostActiveTeam />
        <MostTeamVotes />
        <MostActiveUser />
        <MostUserVotes />
      </div>
    </section>
  );
}
