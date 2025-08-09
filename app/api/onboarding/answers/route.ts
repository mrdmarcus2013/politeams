import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET: Group answers by question, then by answer
 */
export async function GET(_req: Request) {
  const session = await getServerSession(authOptions);

  // Optional: enforce ADMIN
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all answers with user/team relationship
  const answers = await prisma.onboardingAnswer.findMany({
    include: {
      user: {
        include: {
          team: true,
        },
      },
    },
  });

  // Types for clarity
  type AnswerCounts = {
    totalVotes: number;
    teamVotes: Record<string, number>;
  };

  // Organize data: group by question → then by answer
  const groupedByQuestion: Record<string, Record<string, AnswerCounts>> = {};

  answers.forEach((ans) => {
    const { question, answer, user } = ans;
    const teamSlug = user?.team?.slug || "unassigned";

    if (!groupedByQuestion[question]) {
      groupedByQuestion[question] = {};
    }

    if (!groupedByQuestion[question][answer]) {
      groupedByQuestion[question][answer] = {
        totalVotes: 0,
        teamVotes: {},
      };
    }

    // Increment counts
    const bucket = groupedByQuestion[question][answer];
    bucket.totalVotes++;
    bucket.teamVotes[teamSlug] = (bucket.teamVotes[teamSlug] ?? 0) + 1;
  });

  // Transform into array structure sorted by total votes
  const result = Object.entries(groupedByQuestion).map(([question, answersObj]) => {
    const answersArray = Object.entries(answersObj).map(([answer, counts]) => ({
      answer,
      totalVotes: counts.totalVotes,
      teamVotes: counts.teamVotes,
    }));

    // Sort answers by totalVotes descending
    answersArray.sort((a, b) => b.totalVotes - a.totalVotes);

    return { question, answers: answersArray };
  });

  return NextResponse.json(result);
}

/**
 * POST: Save a single onboarding answer
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const question: string | undefined = body?.question;
  const answer: string | undefined = body?.answer;
  const pointsRaw = body?.points;
  const points = Number.isFinite(pointsRaw) ? Number(pointsRaw) : 1;

  if (!question || !answer) {
    return NextResponse.json(
      { error: "Question and answer are required" },
      { status: 400 }
    );
  }

  await prisma.onboardingAnswer.create({
    data: {
      userId: session.user.id,
      question,
      answer,
      points,
    },
  });

  return NextResponse.json({ success: true });
}

/**
 * PUT: Finalize onboarding by assigning the user to a team
 */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamSlug } = await req.json();

  if (!teamSlug) {
    return NextResponse.json({ error: "teamSlug is required" }, { status: 400 });
  }

  // Find the team by slug
  const team = await prisma.team.findUnique({
    where: { slug: teamSlug },
  });

  if (!team) {
    return NextResponse.json({ error: "Invalid teamSlug" }, { status: 404 });
  }

  // Assign the user to the team
  await prisma.user.update({
    where: { id: session.user.id },
    data: { teamId: team.id },
  });

  // Increment the team's totalVotes count
  await prisma.team.update({
    where: { id: team.id },
    data: { totalVotes: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
