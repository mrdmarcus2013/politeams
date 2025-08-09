import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/app/lib/prisma";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const offsetParam = searchParams.get("offset");
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const polls = await prisma.poll.findMany({
      where: {
        endDate: { lt: today },
      },
      orderBy: {
        startDate: "desc",
      },
      skip: offset,
      take: 1,
      include: {
        options: {
          include: {
            votes: {
              include: {
                user: {
                  include: {
                    team: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const poll = polls[0];
    if (!poll) {
      return NextResponse.json(
        { error: "No poll found for this offset" },
        { status: 404 }
      );
    }

    // === Get User Vote ===
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

    // === Determine Winning Options ===
    const maxVotes = Math.max(...poll.options.map((o) => o.votes.length));
    const winningOptionIds = poll.options
      .filter((o) => o.votes.length === maxVotes)
      .map((o) => o.id);

    // === Determine Contributing Team(s) for Each Winning Option ===
    const winnerTeamMap: Record<string, string | null> = {};
    for (const option of poll.options) {
      if (!winningOptionIds.includes(option.id)) continue;

      const teamCounts: Record<string, number> = {};
      for (const vote of option.votes) {
        if (vote.user.team) {
          const teamName = vote.user.team.nickname || vote.user.team.name;
          teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
        }
      }

      const sorted = Object.entries(teamCounts).sort((a, b) => b[1] - a[1]);
      winnerTeamMap[option.id] = sorted.length ? sorted[0][0] : null;
    }

    // === Determine Top Overall Teams (for label)
    const teamVoteCounts: Record<string, number> = {};
    for (const option of poll.options) {
      for (const vote of option.votes) {
        if (vote.user.team) {
          const teamName = vote.user.team.nickname || vote.user.team.name;
          teamVoteCounts[teamName] = (teamVoteCounts[teamName] || 0) + 1;
        }
      }
    }

    const sortedTeams = Object.entries(teamVoteCounts).sort((a, b) => b[1] - a[1]);
    const topTeams = sortedTeams.filter(([, count]) => count === sortedTeams[0][1]).map(([team]) => team);
    const topTeam = topTeams.length === 1 ? topTeams[0] : null;

    // === Navigability ===
    const totalPolls = await prisma.poll.count({
      where: {
        endDate: { lt: today },
      },
    });

    const canGoBack = offset + 1 < totalPolls;
    const canGoForward = offset > 0;

    // === Response ===
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
          winnerTeam: winnerTeamMap[opt.id] || null,
        })),
        userVoted: userVoteOptionId !== null,
        topTeam,
        topTeams,
      },
      offset,
      canGoBack,
      canGoForward,
    });
  } catch (error) {
    console.error("❌ Error fetching previous poll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
