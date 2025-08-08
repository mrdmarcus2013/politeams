// hooks/usePolls.ts
import { useState, useEffect } from "react";

interface PollOption {
  id: string;
  text: string;
  votesCount: number;
  isWinner?: boolean;
  userVoted?: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  userVoted: boolean;
  topTeam?: string;
}

export function useTodayPoll() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToday() {
      try {
        setLoading(true);
        const res = await fetch("/api/polls/today");
        if (res.ok) {
          const data = await res.json();
          setPoll(data.poll);
        }
      } catch (err) {
        console.error("Error fetching today's poll:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchToday();
  }, []);

  return { poll, loading };
}

export function useYesterdayPoll() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchYesterday() {
      try {
        setLoading(true);
        const res = await fetch("/api/polls/yesterday");
        if (res.ok) {
          const data = await res.json();
          setPoll(data.poll);
        }
      } catch (err) {
        console.error("Error fetching yesterday's poll:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchYesterday();
  }, []);

  return { poll, loading };
}

/**
 * Hook for fetching a single previous poll with date navigation support.
 */
export function usePreviousPoll(date?: Date) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrevious() {
      try {
        setLoading(true);
        const query = date ? `?date=${date.toISOString()}` : "";
        const res = await fetch(`/api/polls/previous${query}`);
        if (res.ok) {
          const data = await res.json();
          setPoll(data.poll);
          setCanGoBack(data.canGoBack);
          setCanGoForward(data.canGoForward);
        } else {
          setPoll(null);
        }
      } catch (err) {
        console.error("Error fetching previous poll:", err);
        setPoll(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPrevious();
  }, [date]);

  return { poll, canGoBack, canGoForward, loading };
}
