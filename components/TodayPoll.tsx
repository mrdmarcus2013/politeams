"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useSWRConfig } from "swr";
import { useTeamColors } from "components/TeamWrapper";
import PollCard from "components/PollCard";

type Option = { id: string; text: string; voted: boolean };
type Poll = { id: string; question: string; options: Option[]; userVoted: boolean };

type BadgeSummary = {
  id: number;
  name: string;
  description: string;
  icon?: string;
};

export default function TodayPoll() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Toast queue
  const [toastBadge, setToastBadge] = useState<BadgeSummary | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastQueueRef = useRef<BadgeSummary[]>([]);
  const toastActiveRef = useRef(false);

  const colors = useTeamColors();
  const { mutate } = useSWRConfig();

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/polls/today");
      if (!res.ok) throw new Error("Failed to fetch today's poll");
      const data = await res.json();
      setPoll(data.poll);
    } catch (err: any) {
      setError(err.message || "Error loading poll");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    try {
      const res = await fetch("/api/polls/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit vote");

      setPoll(data.poll);

      const awarded: BadgeSummary[] = Array.isArray(data.newBadges)
        ? data.newBadges.map((b: any) =>
          typeof b === "string" ? { id: -1, name: b, description: "" } : b
        )
        : [];

      if (awarded.length > 0) {
        triggerConfetti();
        enqueueToasts(awarded);

        // ✅ refresh the Badges section immediately
        await mutate(
          "/api/badges",
          async () => {
            const r = await fetch("/api/badges", { cache: "no-store" });
            return r.json();
          },
          { revalidate: false }
        );
      }
    } catch (err: any) {
      setError(err.message || "Error submitting vote");
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [colors.primary, colors.secondary || "#ffffff"],
    });
  };

  // ───────────── Toast queue logic ─────────────
  const enqueueToasts = (badges: BadgeSummary[]) => {
    toastQueueRef.current.push(...badges);
    if (!toastActiveRef.current) runToastQueue();
  };

  const runToastQueue = () => {
    if (toastActiveRef.current) return;
    toastActiveRef.current = true;

    const displayNext = () => {
      const next = toastQueueRef.current.shift();
      if (!next) {
        toastActiveRef.current = false;
        return;
      }

      setToastBadge(next);
      setToastVisible(true);

      const visibleMs = 2200;
      const fadeMs = 600;

      setTimeout(() => setToastVisible(false), visibleMs);
      setTimeout(() => {
        setToastBadge(null);
        displayNext();
      }, visibleMs + fadeMs);
    };

    displayNext();
  };
  // ─────────────────────────────────────────────

  useEffect(() => {
    fetchPoll();
  }, []);

  return (
    <>
      {/* Floating Toast (center of viewport, bounce effect) */}
      {toastBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className="pointer-events-auto px-4 py-3 rounded-lg shadow-xl text-center"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.65))",
              border: `2px solid ${colors.secondary || "#fff"}`,
              color: colors.secondary || "#fff",
              opacity: toastVisible ? 1 : 0,
              transform: toastVisible
                ? "scale(1) translateY(0)"
                : "scale(1.15) translateY(-6px)",
              transition:
                "transform 350ms cubic-bezier(0.68, -0.6, 0.32, 1.6), opacity 600ms ease",
              maxWidth: 520,
              width: "calc(100% - 2rem)",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: 4 }}>
              🎉 CONGRATS! You just earned the{" "}
              <span style={{ color: colors.secondary || "#fff" }}>{toastBadge.name}</span> badge!
            </div>
            {toastBadge.description && (
              <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
                {toastBadge.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Poll container */}
      <PollCard title="Today’s Poll" variant="primary">
        {loading && <p>Loading today’s poll...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && poll && (
          <>
            <p className="mb-4 text-white">{poll.question}</p>

            <ul style={{ listStyle: "none", padding: 0 }}>
              {poll.options.map((opt) => (
                <li key={opt.id} style={{ marginBottom: "0.5rem" }}>
                  <button
                    onClick={() => handleVote(opt.id)}
                    disabled={poll.userVoted}
                    className="px-4 py-2 rounded border bg-transparent"
                    style={{
                      backgroundColor: opt.voted ? colors.primary : "transparent",
                      color: opt.voted ? "#000" : "#fff",
                      border: `1px solid ${colors.primary}`,
                    }}
                  >
                    {opt.text} {opt.voted && "✓"}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </PollCard>
    </>
  );
}
