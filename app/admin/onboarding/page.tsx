"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { teamMeta } from "app/utils/teamMeta";

/**
 * API response types
 */
type TeamVotes = {
  [teamSlug: string]: number;
};

type AnswerGroup = {
  answer: string;
  totalVotes: number;
  teamVotes: TeamVotes;
};

type QuestionGroup = {
  question: string;
  answers: AnswerGroup[];
};

export default function OnboardingAnswersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [groupedData, setGroupedData] = useState<QuestionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * 🔹 Protect the route (only ADMIN allowed)
   */
  useEffect(() => {
    if (status !== "loading") {
      if (!session?.user || session.user.role !== "ADMIN") {
        router.replace("/dashboard");
      }
    }
  }, [session, status, router]);

  /**
   * 🔹 Fetch grouped answers from the API
   */
  async function loadGroupedAnswers() {
    try {
      const res = await fetch("/api/onboarding/answers");
      const data: QuestionGroup[] = await res.json();
      setGroupedData(data || []);
    } catch (err) {
      console.error("❌ Failed to load grouped answers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      loadGroupedAnswers();
    }
  }, [session]);

  /**
   * 🔹 Loading state
   */
  if (status === "loading" || loading) {
    return <p className="p-4">Loading...</p>;
  }

  /**
   * 🔹 Non-admin users see nothing
   */
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <main className="flex flex-col min-h-screen p-6 gap-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold">Onboarding Answers (Grouped)</h1>
      <p className="text-gray-600 mb-4">
        Showing all answers grouped by question and sorted by total votes.
      </p>

      {groupedData.length > 0 ? (
        groupedData.map((questionGroup, qIdx) => (
          <div
            key={qIdx}
            className="border rounded bg-white overflow-hidden mb-8"
          >
            <h2 className="text-xl font-semibold bg-gray-100 p-3">
              {questionGroup.question}
            </h2>
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Answer</th>
                  <th className="text-right p-3">Total Votes</th>
                  {Object.entries(teamMeta).map(([slug, meta]) => (
                    <th key={slug} className="text-right p-3">
                      {meta.nickname}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questionGroup.answers.length > 0 ? (
                  questionGroup.answers.map((ans, aIdx) => (
                    <tr key={aIdx} className="border-t">
                      <td className="p-3">{ans.answer}</td>
                      <td className="p-3 text-right">{ans.totalVotes}</td>
                      {Object.entries(teamMeta).map(([slug]) => (
                        <td key={slug} className="p-3 text-right">
                          {ans.teamVotes[slug] || 0}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2 + Object.keys(teamMeta).length}
                      className="p-3 text-center text-gray-500"
                    >
                      No answers recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No answers recorded yet.</p>
      )}

      {/* Back Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => router.push("/admin")}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          ⬅ Back to Admin Dashboard
        </button>
      </div>
    </main>
  );
}
