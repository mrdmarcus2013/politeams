import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { evaluateBadgesOnVote } from "@/app/lib/badges";
import { prisma } from "@/app/lib/prisma";


/**
 * GET — Fetch today's active poll for the current user
 */
export async function GET() {
  try {
    const now = new Date();

    // Find today's active poll
    const poll = await prisma.poll.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { options: true },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "No active poll found" },
        { status: 404 }
      );
    }

    // Check if current user already voted
    const session = await getServerSession(authOptions);
    let userVoteOptionId: string | null = null;

    if (session?.user?.id) {
      const vote = await prisma.vote.findFirst({
        where: {
          userId: session.user.id,
          option: { pollId: poll.id },
        },
        select: { optionId: true },
      });
      userVoteOptionId = vote?.optionId ?? null;
    }

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        options: poll.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          voted: userVoteOptionId === opt.id,
        })),
        userVoted: userVoteOptionId !== null,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching today's poll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST — Submit a vote for the current user
 * Returns updated poll state + any *newly awarded* badges as full objects.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { optionId } = await request.json();
    if (!optionId) {
      return NextResponse.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }

    // Validate option & poll
    const option = await prisma.option.findUnique({
      where: { id: optionId },
      include: { poll: true },
    });
    if (!option?.poll) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }

    const now = new Date();
    if (option.poll.startDate > now || option.poll.endDate < now) {
      return NextResponse.json({ error: "Poll is closed" }, { status: 403 });
    }

    // Ensure user hasn't already voted in this poll
    const already = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        option: { pollId: option.poll.id },
      },
      select: { id: true },
    });
    if (already) {
      return NextResponse.json(
        { error: "You have already voted in this poll" },
        { status: 403 }
      );
    }

    // Create the vote
    const vote = await prisma.vote.create({
      data: {
        userId: session.user.id,
        optionId,
      },
      select: { id: true },
    });

    // 🏅 Evaluate badges for this vote — returns array of *badge IDs*
    const newBadgeIds = await evaluateBadgesOnVote(vote.id);

    // Expand badge IDs to full objects for the client celebration UI
    const newBadges = newBadgeIds.length
      ? await prisma.badge.findMany({
        where: { id: { in: newBadgeIds } },
        select: { id: true, name: true, description: true, icon: true },
      })
      : [];

    // Return poll with just the user's choice marked + any new badges
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: option.poll.id },
      include: { options: true },
    });
    if (!updatedPoll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json({
      poll: {
        id: updatedPoll.id,
        question: updatedPoll.question,
        options: updatedPoll.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          voted: opt.id === optionId,
        })),
        userVoted: true,
      },
      newBadges, // [{ id, name, description, icon }]
    });
  } catch (error) {
    console.error("❌ Error submitting vote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
