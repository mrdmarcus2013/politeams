import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";


export async function GET() {
  try {
    const now = new Date();
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayMidnight);
    yesterdayStart.setDate(todayMidnight.getDate() - 1);
    const yesterdayEnd = new Date(todayMidnight);

    const poll = await prisma.poll.findFirst({
      where: {
        startDate: { gte: yesterdayStart },
        endDate: { lte: yesterdayEnd },
      },
      include: {
        options: {
          include: {
            votes: {
              include: {
                user: { include: { team: true } },
              },
            },
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: "No poll found for yesterday" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    let userVoteOptionId: string | null = null;

    if (session?.user?.id) {
      const vote = await prisma.vote.findFirst({
        where: {
          userId: session.user.id,
          option: { pollId: poll.id },
        },
      });
      userVoteOptionId = vote ? vote.optionId : null;
    }

    // Determine winning options
    const maxVotes = Math.max(...poll.options.map((o) => o.votes.length));
    const winningOptionIds = poll.options
      .filter((o) => o.votes.length === maxVotes)
      .map((o) => o.id);

    // Get team with most votes per winning option
    const optionTeamMap: Record<string, string | null> = {};
    const teamVoteCounts: Record<string, number> = {};

    for (const option of poll.options) {
      const isWinning = winningOptionIds.includes(option.id);

      const voteCountsForOption: Record<string, number> = {};
      for (const vote of option.votes) {
        const team = vote.user.team;
        if (team) {
          const teamName = team.nickname || team.name;

          // Track total votes across all options
          teamVoteCounts[teamName] = (teamVoteCounts[teamName] || 0) + 1;

          // Track per-option only for winning options
          if (isWinning) {
            voteCountsForOption[teamName] = (voteCountsForOption[teamName] || 0) + 1;
          }
        }
      }

      if (isWinning) {
        const sorted = Object.entries(voteCountsForOption).sort((a, b) => b[1] - a[1]);
        optionTeamMap[option.id] = sorted.length > 0 ? sorted[0][0] : null;
      }
    }

    const sortedTotalTeams = Object.entries(teamVoteCounts).sort((a, b) => b[1] - a[1]);
    const topTeam = sortedTotalTeams.length > 0 ? sortedTotalTeams[0][0] : null;

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        options: poll.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          votesCount: opt.votes.length,
          isWinner: winningOptionIds.includes(opt.id),
          userVoted: userVoteOptionId === opt.id,
          winnerTeam: optionTeamMap[opt.id] || null,
        })),
        userVoted: userVoteOptionId !== null,
        topTeam,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching yesterday's poll:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
