"use client";

import { useEffect, useState, useMemo } from "react";
import PollCard from "components/PollCard";
import { teamMeta } from "@/app/utils/teamMeta";

type Option = {
  id: string;
  text: string;
  votesCount: number;
  isWinner: boolean;
  userVoted: boolean;
  winnerTeam?: string | null; // slug or nickname
};

type Poll = {
  id: string;
  question: string;
  options: Option[];
  userVoted: boolean;
};

// helper: get colors by slug or nickname (case-insensitive)
function getTeamColorsByKey(key?: string | null) {
  const fallback = { bg: "#111827", text: "#FFFFFF" }; // slate-900 / white
  if (!key) return fallback;

  // try slug key directly
  const direct = teamMeta[key as keyof typeof teamMeta];
  if (direct) return { bg: direct.colors.primary, text: direct.colors.textColor };

  // try nickname match
  const lower = key.toLowerCase();
  const found = Object.values(teamMeta).find(
    (m) => m.nickname.toLowerCase() === lower
  );
  if (found) return { bg: found.colors.primary, text: found.colors.textColor };

  return fallback;
}

export default function YesterdayPoll() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoll = async () => {
      const res = await fetch("/api/polls/yesterday", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPoll(data.poll);
      }
      setLoading(false);
    };
    fetchPoll();
  }, []);

  const userVoteText = useMemo(() => {
    const chosen = poll?.options.find((opt) => opt.userVoted);
    return chosen ? chosen.text.split(" ").slice(0, 2).join(" ") : null;
  }, [poll]);

  const winnerTeams = useMemo(() => {
    return poll?.options
      .filter((opt) => opt.isWinner && opt.winnerTeam)
      .map((opt) => opt.winnerTeam!) ?? [];
  }, [poll]);

  const winnerText = useMemo(() => {
    if (!poll || winnerTeams.length === 0) return "None";
    if (winnerTeams.length === 1) return winnerTeams[0]!;
    return "TIE";
  }, [poll, winnerTeams]);

  return (
    <PollCard title="Yesterday's Poll" variant="highlight">
      {loading && <p>Loading…</p>}

      {!loading && poll && (
        <>
          {/* Winner and Vote Summary */}
          <div className="flex justify-between text-sm text-white mb-2">
            <div>
              <span role="img" aria-label="Trophy">🏆</span>{" "}
              <span className="text-gray-300">Winner:</span>{" "}
              <span className="font-bold text-white">{winnerText}</span>
            </div>
            {poll.userVoted && userVoteText && (
              <div className="text-right">
                <span className="text-gray-300">Your vote:</span>{" "}
                <span className="font-semibold text-white">{userVoteText}</span>
              </div>
            )}
          </div>

          {/* Poll Content */}
          <p className="mb-4">{poll.question}</p>
          <ul className="space-y-2">
            {poll.options.map((opt) => {
              const teamName = opt.winnerTeam ?? null;
              const { bg, text } = getTeamColorsByKey(teamName);

              // winners get team colors; others use the base styles
              const style = opt.isWinner && teamName
                ? { backgroundColor: bg, color: text, borderColor: bg }
                : undefined;

              return (
                <li
                  key={opt.id}
                  className="rounded px-4 py-2 flex justify-between items-center border border-gray-600"
                  style={style}
                >
                  <span className={opt.isWinner ? "font-bold" : ""}>
                    {opt.text}
                  </span>
                  <span className="text-sm opacity-80">
                    {opt.votesCount} votes
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </PollCard>
  );
}
