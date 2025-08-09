"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import DiscussionSection from "@/components/DiscussionSection";
import { teamMeta } from "../utils/teamMeta";
import TeamWrapper from "components/TeamWrapper";
import TodayPoll from "components/TodayPoll";
import YesterdayPoll from "components/YesterdayPoll";
import PreviousPolls from "components/PreviousPolls";
import LeaderboardSection from "components/LeaderboardSection";
import BadgeSection from "components/BadgeSection";
import GlowCard from "components/GlowCard";
import HeaderBar from "@/components/HeaderBar";

export default function DashboardPage() {
  const { data: session, status, update } = useSession();
  const [retrying, setRetrying] = useState(false);

  if (status === "loading") {
    return <p className="p-4">Loading session...</p>;
  }

  if (!session?.user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <h1 className="text-2xl font-bold">Not Logged In</h1>
        <p>Please sign in to continue.</p>
      </main>
    );
  }

  const teamSlug = session.user.teamSlug;

  useEffect(() => {
    if (!teamSlug && !retrying) {
      setRetrying(true);
      update();
    }
  }, [teamSlug, retrying, update]);

  if (!teamSlug) {
    return <p className="p-4">Loading your team...</p>;
  }

  const teamInfo = teamMeta[teamSlug];
  if (!teamInfo) {
    return <p className="p-4">Invalid team.</p>;
  }

  const rank = session.user.rank;

  return (
    <TeamWrapper teamSlug={teamSlug}>
      <main className="flex flex-col min-h-screen bg-black text-white">
        {/* === Header === */}
        <header className="sticky top-0 z-40 bg-black shadow p-4 flex flex-col items-center gap-2 border-b border-gray-800">
          <h1 className="relative text-4xl font-extrabold tracking-wide text-pink-500 text-center leading-tight">
            POLIT
            <span className="relative inline-block">
              <span className="relative text-pink-500 z-0">ICS</span>
              <span
                className="absolute text-cyan-400 font-handwriting z-30 inset-0 flex items-center justify-center"
                style={{
                  transform: "rotate(-5deg) translate(28%, -18%)",
                  fontSize: "inherit",
                }}
              >
                eams
              </span>
            </span>
          </h1>

          <div className="flex items-center gap-3 mt-1">
            <img
              src={teamInfo.logo}
              alt={teamInfo.nickname}
              className="h-10 w-10 object-contain"
            />
            <h2
              className="text-lg font-semibold"
              style={{ color: teamInfo.colors.primary }}
            >
              {rank?.title}
            </h2>
          </div>

          {rank?.description && (
            <p className="text-sm text-center text-gray-300 max-w-xs leading-snug">
              {rank.description}
            </p>
          )}

          {session.user.role === "ADMIN" && (
            <div className="mt-2">
              <Link href="/admin">
                <button className="bg-pink-500 text-black px-4 py-1 rounded hover:bg-pink-600 text-sm">
                  Admin
                </button>
              </Link>
            </div>
          )}
        </header>

        {/* === Main Content === */}
        <div className="flex flex-col gap-6 p-4 max-w-3xl w-full mx-auto">
          <TodayPoll />
          <YesterdayPoll />
          <DiscussionSection /> 
          <PreviousPolls />

          {/* Leaderboards in GlowCard */}
          <GlowCard
            title="Leaderboards"
            borderColor={teamInfo.colors.primary}
            titleColor={teamInfo.colors.secondary}
          >
            <LeaderboardSection />
          </GlowCard>

          {/* Badges in GlowCard */}
          <GlowCard
            title="Badges"
            borderColor={teamInfo.colors.primary}
            titleColor={teamInfo.colors.secondary}
          >
            <BadgeSection />
          </GlowCard>
        </div>

        {/* === Footer === */}
        <footer className="p-4 bg-black border-t border-gray-800 mt-auto flex justify-center">
          <button
            onClick={() => signOut({ callbackUrl: "/auth" })}
            className="bg-red-500 text-black px-6 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </footer>
      </main>
    </TeamWrapper>
  );
}
