"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PollCard from "components/PollCard";
import { useTeamColors } from "components/TeamWrapper";
import { teamMeta } from "../app/utils/teamMeta";

type Option = {
  id: string;
  text: string;
  votesCount: number;
  isWinner: boolean;
  userVoted: boolean;
  winnerTeam?: string;
};

type Poll = {
  id: string;
  question: string;
  options: Option[];
  userVoted: boolean;
  topTeam: string | null;
  topTeams?: string[];
};

export default function PreviousPolls() {
  const [pollsCache, setPollsCache] = useState<Record<number, Poll>>({});
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const colors = useTeamColors();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPoll = async () => {
      setLoading(true);
      setShowContent(false); // fade-out

      // If poll is already cached, use it
      if (pollsCache[offset]) {
        setPoll(pollsCache[offset]);
        setCanGoBack(offset < 29); // or adjust logic as needed
        setCanGoForward(offset > 0);
        setLoading(false);
        setTimeout(() => setShowContent(true), 50);
        return;
      }

      try {
        const res = await fetch(`/api/polls/previous?offset=${offset}`);
        const data = await res.json();

        setPoll(data.poll);
        setPollsCache((prev) => ({ ...prev, [offset]: data.poll }));
        setCanGoBack(data.canGoBack);
        setCanGoForward(data.canGoForward);
      } catch (err) {
        console.error("❌ Error loading previous poll:", err);
        setPoll(null);
      } finally {
        setLoading(false);
        
        setTimeout(() => setShowContent(true), 50);
      }
    };

    loadPoll();
  }, [offset, pollsCache]);

  const getTeamPrimaryByNickname = (nickname: string): string | null => {
    for (const slug of Object.keys(teamMeta)) {
      const t = teamMeta[slug];
      if (t?.nickname === nickname) {
        return t.colors.primary;
      }
    }
    return null;
  };

  const winnerLine = useMemo(() => {
    if (!poll) return null;
    if (poll.topTeam) return `🏆 Winner: ${poll.topTeam}`;
    if (poll.topTeams?.length) return `🤝 Tie: ${poll.topTeams.join(", ")}`;
    return null;
  }, [poll]);

  const userVoteLabel = useMemo(() => {
    if (!poll?.userVoted) return null;
    const answer = poll.options.find((o) => o.userVoted);
    if (!answer) return null;
    const words = answer.text.split(" ").slice(0, 2).join(" ");
    return `Your vote: ${words}`;
  }, [poll]);

  const handleBack = () => setOffset((prev) => prev + 1);
  const handleForward = () => setOffset((prev) => Math.max(prev - 1, 0));

  return (
    <PollCard
      title="Previous Polls"
      variant="primary"
      
    >
      <div ref={containerRef} />

      {loading && <p>Loading…</p>}

      {!loading && poll && (
        <div
          className={`transition-opacity duration-500 ${showContent ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>{winnerLine}</span>
            {userVoteLabel && <span className="italic">{userVoteLabel}</span>}
          </div>

          <p className="mb-4">{poll.question}</p>

          <ul className="space-y-2">
            {poll.options.map((opt) => {
              const highlightColor = opt.isWinner && opt.winnerTeam
                ? getTeamPrimaryByNickname(opt.winnerTeam as keyof typeof teamMeta) ?? "#F472B6"
                : "transparent";

              return (
                <li
                  key={opt.id}
                  className="flex justify-between items-center px-3 py-2 rounded border"
                  style={{
                    borderColor: opt.isWinner ? highlightColor : "transparent",
                    backgroundColor: opt.isWinner ? highlightColor : "transparent",
                    color: opt.isWinner ? "#000000" : "#ffffff",
                    fontWeight: opt.isWinner ? "bold" : "normal",
                  }}
                >
                  <span>{opt.text}</span>
                  <span className="text-gray-400">{opt.votesCount} votes</span>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-between mt-4 text-sm text-gray-400">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className={`${
                canGoBack ? "hover:text-white" : "text-gray-500 cursor-not-allowed"
              }`}
            >
              ◀ Back
            </button>
            <button
              onClick={handleForward}
              disabled={!canGoForward}
              className={`${
                canGoForward ? "hover:text-white" : "text-gray-500 cursor-not-allowed"
              }`}
            >
              Forward ▶
            </button>
          </div>
        </div>
      )}
    </PollCard>
  );
}
