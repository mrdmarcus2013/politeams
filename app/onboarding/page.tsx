"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// === Types ===
type Team = string;

type Option = {
  text: string;
  scores: Record<Team, number>;
};

type Question = {
  question: string;
  weight: number;
  options: Option[];
};

// === Quiz Questions (full 6) ===
const quiz: Question[] = [
  // (same quiz data as before)
  {
    question: "What should be the primary role of government in society?",
    weight: 6,
    options: [
      { text: "Ensure basic needs like healthcare and education are met for all.", scores: { Left: 1 } },
      { text: "Protect individual liberties and limit government involvement in daily life.", scores: { Libertarian: 1 } },
      { text: "Maintain stability and balance between competing interests.", scores: { Center: 1 } },
      { text: "Drive social progress and expand rights through policy change.", scores: { Progressive: 1 } },
      { text: "Uphold cultural traditions and preserve national security.", scores: { Right: 1 } },
      { text: "Enforce strong protections for the environment and future generations.", scores: { Environmentalist: 1 } },
      { text: "Use data-driven planning to optimize outcomes for society.", scores: { Technocrat: 1 } },
      { text: "Dismantle centralized power structures and empower local communities.", scores: { Anarchist: 1 } },
    ],
  },
  // ... rest of questions unchanged
  {
    question: "Which approach best describes how the economy should be managed?",
    weight: 5,
    options: [
      { text: "Strong public programs funded by higher taxes on the wealthy.", scores: { Left: 1 } },
      { text: "Free-market competition with minimal government interference.", scores: { Libertarian: 1 } },
      { text: "Pragmatic regulations to avoid extremes and ensure stability.", scores: { Center: 1 } },
      { text: "Bold reforms to close inequality gaps and support marginalized groups.", scores: { Progressive: 1 } },
      { text: "Policies that strengthen traditional industries and national self-reliance.", scores: { Right: 1 } },
      { text: "Incentives and penalties to encourage sustainable business practices.", scores: { Environmentalist: 1 } },
      { text: "Centralized long-term planning using advanced technology and forecasting.", scores: { Technocrat: 1 } },
      { text: "Local cooperatives and decentralized economies over large corporations.", scores: { Anarchist: 1 } },
    ],
  },
  {
    question: "When individual freedoms conflict with the greater good, how should society respond?",
    weight: 4,
    options: [
      { text: "Prioritize the collective good through strong government action.", scores: { Left: 1 } },
      { text: "Protect individual freedom even when it may impact others.", scores: { Libertarian: 1 } },
      { text: "Seek balanced compromises that respect both sides.", scores: { Center: 1 } },
      { text: "Expand protections for marginalized communities even if it challenges tradition.", scores: { Progressive: 1 } },
      { text: "Defend cultural norms and established social order.", scores: { Right: 1 } },
      { text: "Limit freedoms that harm the environment or public health.", scores: { Environmentalist: 1 } },
      { text: "Use evidence-based standards to determine acceptable limits.", scores: { Technocrat: 1 } },
      { text: "Avoid centralized decision-making; communities should decide for themselves.", scores: { Anarchist: 1 } },
    ],
  },
  {
    question: "How should power and authority be structured?",
    weight: 2,
    options: [
      { text: "A strong central government that provides robust social protections.", scores: { Left: 1 } },
      { text: "Minimal central authority; power should rest with individuals.", scores: { Libertarian: 1 } },
      { text: "Distribute power among multiple branches to keep it balanced.", scores: { Center: 1 } },
      { text: "Elected leaders should be empowered to pass ambitious reforms.", scores: { Progressive: 1 } },
      { text: "Power should reinforce cultural unity and defend tradition.", scores: { Right: 1 } },
      { text: "Strong global institutions and binding international agreements should lead on major issues.", scores: { Environmentalist: 1 } },
      { text: "Appoint experts and scientists to guide major decisions.", scores: { Technocrat: 1 } },
      { text: "Break up centralized power entirely and rely on self-governance.", scores: { Anarchist: 1 } },
    ],
  },
  {
    question: "What best describes your view of social change?",
    weight: 1,
    options: [
      { text: "Broad, government-led programs to lift everyone together.", scores: { Left: 1 } },
      { text: "Change should happen naturally without government forcing it.", scores: { Libertarian: 1 } },
      { text: "Moderate adjustments that avoid dramatic disruptions.", scores: { Center: 1 } },
      { text: "Major reforms are needed now to protect vulnerable groups.", scores: { Progressive: 1 } },
      { text: "Preserve traditional values and slow down rapid change.", scores: { Right: 1 } },
      { text: "Environmental priorities must shape all social progress.", scores: { Environmentalist: 1 } },
      { text: "Data should drive how and when social changes are implemented.", scores: { Technocrat: 1 } },
      { text: "Change should happen from the ground up through local communities.", scores: { Anarchist: 1 } },
    ],
  },
  {
    question: "What is most important for society’s long-term future?",
    weight: 3,
    options: [
      { text: "Reducing inequality and guaranteeing economic security.", scores: { Left: 1 } },
      { text: "Maximum individual freedom and reduced government oversight.", scores: { Libertarian: 1 } },
      { text: "A balanced approach that adapts as needed.", scores: { Center: 1 } },
      { text: "Expanding civil rights and building a more inclusive society.", scores: { Progressive: 1 } },
      { text: "Preserving national identity and cultural heritage.", scores: { Right: 1 } },
      { text: "Addressing climate change and protecting natural resources.", scores: { Environmentalist: 1 } },
      { text: "Using technology and research to solve major challenges.", scores: { Technocrat: 1 } },
      { text: "Empowering communities to self-organize without central control.", scores: { Anarchist: 1 } },
    ],
  },
];

// === Helper ===
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function OnboardingPage() {
  const { update } = useSession();
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<Team, number>>({});
  const [shuffledOptions, setShuffledOptions] = useState<Option[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  // Restore state from localStorage
  useEffect(() => {
    const savedIndex = localStorage.getItem("onboardingCurrentQuestion");
    const savedScores = localStorage.getItem("onboardingScores");

    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }

    if (savedIndex) {
      const idx = Number(savedIndex);
      if (idx < quiz.length) {
        setCurrentQuestion(idx);
        setShuffledOptions(shuffle(quiz[idx].options));
      } else {
        setCurrentQuestion(0);
        setShuffledOptions(shuffle(quiz[0].options));
      }
    } else {
      setCurrentQuestion(0);
      setShuffledOptions(shuffle(quiz[0].options));
    }
  }, []);

  // Handle answer selection
  const handleAnswer = async (option: Option) => {
    if (isFinishing) return;

    const q = quiz[currentQuestion];
    if (!q) return;

    // Save the answer to backend
    await fetch("/api/onboarding/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q.question,
        answer: option.text,
      }),
    });

    // Update scores
    const questionWeight = q.weight;
    const updatedScores = { ...scores };
    for (const [team, points] of Object.entries(option.scores)) {
      updatedScores[team] = (updatedScores[team] || 0) + points * questionWeight;
    }
    setScores(updatedScores);
    localStorage.setItem("onboardingScores", JSON.stringify(updatedScores));

    // Next question or finish
    if (currentQuestion + 1 < quiz.length) {
      const nextIdx = currentQuestion + 1;
      setCurrentQuestion(nextIdx);
      localStorage.setItem("onboardingCurrentQuestion", String(nextIdx));
      setShuffledOptions(shuffle(quiz[nextIdx].options));
    } else {
      setIsFinishing(true);

      // Determine winning team
      let maxTeam: Team = "";
      let maxScore = -Infinity;
      Object.entries(updatedScores).forEach(([team, score]) => {
        if (score > maxScore) {
          maxScore = score;
          maxTeam = team;
        }
      });

      const teamSlug = maxTeam.toLowerCase();

      // Finalize quiz by updating the team in backend
      await fetch("/api/onboarding/answers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamSlug }),
      });

      // Clear localStorage and redirect
      localStorage.removeItem("onboardingCurrentQuestion");
      localStorage.removeItem("onboardingScores");
      await update();
      router.replace("/dashboard");
    }
  };

  const q = quiz[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.length) * 100;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-center p-6">
      {/* POLITeams Title */}
      <div className="mb-6">
        <h1 className="relative text-4xl md:text-6xl font-extrabold tracking-wide text-pink-500">
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
        <p className="uppercase text-lg md:text-2xl text-cyan-400 font-semibold mt-4">
          Onboarding Quiz
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md h-3 bg-gray-700 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Questions / Answers */}
      {isFinishing ? (
        <p className="text-lg text-cyan-400">Finishing quiz...</p>
      ) : q ? (
        <>
          <p className="text-lg text-white max-w-2xl mb-6">{q.question}</p>
          <div className="flex flex-col gap-4 w-full max-w-md">
            {shuffledOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                disabled={isFinishing}
                className="px-6 py-3 border-2 border-pink-500 text-cyan-400 text-lg font-bold uppercase rounded hover:bg-pink-500 hover:text-black transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-lg text-cyan-400">Loading next question...</p>
      )}
    </main>
  );
}
