import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";


export async function GET() {
  try {
    // === 1. Most Popular Team (by user count)
    const mostPopularTeam = await prisma.team.findFirst({
      orderBy: { users: { _count: "desc" } },
      include: { users: true },
    });

    // === Get vote date range for time-based stats
    const [earliestVote, latestVote] = await Promise.all([
      prisma.vote.findFirst({ orderBy: { timestamp: "asc" } }),
      prisma.vote.findFirst({ orderBy: { timestamp: "desc" } }),
    ]);

    let totalVoteDays = 1;
    if (earliestVote && latestVote) {
      const diff = latestVote.timestamp.getTime() - earliestVote.timestamp.getTime();
      totalVoteDays = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // === 2. Most Active Team (by average votes per user)
    const allTeams = await prisma.team.findMany({
      include: {
        users: {
          select: {
            id: true,
            totalVotes: true,
          },
        },
      },
    });

    let mostActiveTeam: {
      slug: string;
      name: string;
      nickname: string;
      avgVotesPerUser: number;
    } | null = null;

    for (const team of allTeams) {
      const teamTotalVotes = team.users.reduce((sum, u) => sum + u.totalVotes, 0);
      const userCount = team.users.length || 1;
      const avgVotes = teamTotalVotes / userCount;

      if (!mostActiveTeam || avgVotes > mostActiveTeam.avgVotesPerUser) {
        mostActiveTeam = {
          slug: team.slug,
          name: team.name,
          nickname: team.nickname,
          avgVotesPerUser: parseFloat(avgVotes.toFixed(2)),
        };
      }
    }

    // === 3. Most Team Votes (team.totalVotes)
    const mostTeamVotes = await prisma.team.findFirst({
      orderBy: { totalVotes: "desc" },
    });

    // === 4. Most Active User (by votes in the past 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setUTCDate(oneWeekAgo.getUTCDate() - 7);

    const usersWithVotes = await prisma.user.findMany({
      include: {
        team: true,
        votes: {
          where: {
            timestamp: {
              gte: oneWeekAgo,
            },
          },
        },
      },
    });

    let mostActiveUser: {
      name: string;
      votesLast7Days: number;
      team: string | null;
    } | null = null;

    for (const user of usersWithVotes) {
      const count = user.votes.length;

      if (!mostActiveUser || count > mostActiveUser.votesLast7Days) {
        mostActiveUser = {
          name: user.name || "Anonymous",
          votesLast7Days: count,
          team: user.team?.slug || null,
        };
      }
    }

    // === 5. Most User Votes (user.totalVotes)
    const mostUserVotes = await prisma.user.findFirst({
      orderBy: { totalVotes: "desc" },
      include: { team: true },
    });

    return NextResponse.json({
      mostPopularTeam: mostPopularTeam
        ? {
            slug: mostPopularTeam.slug,
            name: mostPopularTeam.name,
            nickname: mostPopularTeam.nickname,
            userCount: mostPopularTeam.users.length,
          }
        : null,

      mostActiveTeam: mostActiveTeam
        ? {
            slug: mostActiveTeam.slug,
            name: mostActiveTeam.name,
            nickname: mostActiveTeam.nickname,
            avgVotesPerUser: mostActiveTeam.avgVotesPerUser,
          }
        : null,


      mostTeamVotes: mostTeamVotes
        ? {
            slug: mostTeamVotes.slug,
            name: mostTeamVotes.name,
            nickname: mostTeamVotes.nickname,
            totalVotes: mostTeamVotes.totalVotes,
          }
        : null,

      mostActiveUser: mostActiveUser
        ? {
            name: mostActiveUser.name,
            totalVotes: mostActiveUser.votesLast7Days,
            team: mostActiveUser.team,
          }
        : null,

      mostUserVotes: mostUserVotes
        ? {
            name: mostUserVotes.name,
            totalVotes: mostUserVotes.totalVotes,
            team: mostUserVotes.team?.slug || null,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Error fetching leaderboard data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
