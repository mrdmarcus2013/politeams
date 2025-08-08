import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";


/**
 * GET: Group answers by question, then by answer
 */
export async function GET(req: Request) {
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

  // Organize data: group by question → then by answer
  const groupedByQuestion: Record<string, any> = {};

  answers.forEach((ans) => {
    const { question, answer, user } = ans;
    const teamSlug = user?.team?.slug || "unassigned";

    if (!groupedByQuestion[question]) {
      groupedByQuestion[question] = {};
    }

    if (!groupedByQuestion[question][answer]) {
      groupedByQuestion[question][answer] = {
        totalVotes: 0,
        teamVotes: {} as Record<string, number>,
      };
    }

    // Increment counts
    groupedByQuestion[question][answer].totalVotes++;
    groupedByQuestion[question][answer].teamVotes[teamSlug] =
      (groupedByQuestion[question][answer].teamVotes[teamSlug] || 0) + 1;
  });

  // Transform into array structure sorted by total votes
  const result = Object.entries(groupedByQuestion).map(([question, answers]) => {
    const answersArray = Object.entries(answers).map(([answer, counts]) => ({
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

  const { question, answer, points } = await req.json();

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
      points: points || 1,
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
