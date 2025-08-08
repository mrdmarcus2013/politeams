// app/lib/badges.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const BADGE = {
    FIRST_VOTE: "First Vote",
    STREAK_3: "Streak Starter",
    STREAK_7: "Full Week Warrior",
    STREAK_30: "Month of Mayhem",
    UNDERDOG_10: "Underdog Voter",
    TREND_10: "Trend Rider",
    MIDNIGHT: "Midnight Maverick",
    FIRST_TO_VOTE: "First to Vote",
    LAST_TO_VOTE: "Last to Vote",
    CLUTCH: "Clutch Voter",
    CHAOS_AGENT: "Chaos Agent",
    STREAK_SLAYER: "Streak Slayer",
    BALLOT_BEAST_100: "Ballot Beast",
    MEGA_INFLUENCER: "Mega Influencer",
    QUIET_POWER: "Quiet Power",
    OVERACHIEVER: "Overachiever",
} as const;

/* ───────────────────────────── Helpers ───────────────────────────── */

/** App day starts at 04:00 UTC. If a vote is before 04:00 UTC, it belongs to the previous "app day". */
function startOfAppDayUTC(dt: Date) {
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth();
    const d = dt.getUTCDate();
    const hour = dt.getUTCHours();
    // Base for "today" at 04:00 UTC
    let dayStart = new Date(Date.UTC(y, m, d, 4, 0, 0, 0));
    // If we're before 04:00 UTC, snap to yesterday's 04:00 UTC
    if (hour < 4) {
        dayStart = new Date(Date.UTC(y, m, d - 1, 4, 0, 0, 0));
    }
    return dayStart;
}

async function getUserStreak(userId: string): Promise<number> {
    // Streak = consecutive "app days" (starting 04:00 UTC) including *today*.
    const votes = await prisma.vote.findMany({
        where: { userId },
        select: { timestamp: true },
        orderBy: { timestamp: "desc" },
        take: 80, // plenty for 30-day checks
    });

    const uniqueAppDaysDesc = Array.from(
        new Set(votes.map((v) => startOfAppDayUTC(v.timestamp).toISOString()))
    )
        .map((iso) => new Date(iso))
        .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let cursor = startOfAppDayUTC(new Date());
    for (const d of uniqueAppDaysDesc) {
        const diffDays = Math.round((cursor.getTime() - d.getTime()) / 86400000);
        if (diffDays === 0) {
            streak++;
            cursor = new Date(cursor.getTime() - 86400000); // move back exactly one app day
        } else {
            break;
        }
    }
    return streak;
}

async function awardBadgeByName(userId: string, badgeName: string): Promise<number | null> {
    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (!badge) return null;
    try {
        await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
        return badge.id;
    } catch (e: any) {
        if (e?.code === "P2002") return null; // already has it
        throw e;
    }
}
export async function awardBadge(userId: string, badgeName: string) {
    await awardBadgeByName(userId, badgeName);
}

/* ─────────────────────── Rule plumbing (vote-time) ─────────────────────── */

type VoteContext = { voteId: string; userId: string; timestamp: Date };
type VoteRule = (ctx: VoteContext) => Promise<number | null>;

export const voteRules: VoteRule[] = [
    // First Vote
    async ({ userId }) => {
        const count = await prisma.vote.count({ where: { userId } });
        if (count === 1) return awardBadgeByName(userId, BADGE.FIRST_VOTE);
        return null;
    },

    // Midnight Maverick (00:00–01:00 local time)
    async ({ userId, timestamp }) => {
        const hour = timestamp.getHours();
        if (hour >= 0 && hour < 1) return awardBadgeByName(userId, BADGE.MIDNIGHT);
        return null;
    },

    // Streak 3 / 7 / 30 (uses 04:00 UTC boundary)
    async ({ userId }) => {
        const streak = await getUserStreak(userId);
        if (streak >= 30) return awardBadgeByName(userId, BADGE.STREAK_30);
        if (streak >= 7) return awardBadgeByName(userId, BADGE.STREAK_7);
        if (streak >= 3) return awardBadgeByName(userId, BADGE.STREAK_3);
        return null;
    },

    // Ballot Beast (100 total votes)
    async ({ userId }) => {
        const total = await prisma.vote.count({ where: { userId } });
        if (total >= 100) return awardBadgeByName(userId, BADGE.BALLOT_BEAST_100);
        return null;
    },
];

export async function evaluateBadgesOnVote(voteId: string): Promise<number[]> {
    const vote = await prisma.vote.findUnique({ where: { id: voteId } });
    if (!vote) return [];
    const ctx: VoteContext = { voteId, userId: vote.userId, timestamp: vote.timestamp };

    const awardedIds: number[] = [];
    for (const rule of voteRules) {
        const id = await rule(ctx);
        if (id) awardedIds.push(id);
    }
    return Array.from(new Set(awardedIds));
}

/* ───────────── Poll-close logic (unchanged) ───────────── */

export async function evaluateBadgesOnPollClose(pollId: string): Promise<number[]> {
    const options = await prisma.option.findMany({
        where: { pollId },
        include: { votes: true },
    });
    if (options.length === 0) return [];

    const awarded: number[] = [];
    const allVotes = await prisma.vote.findMany({
        where: { option: { pollId } },
        orderBy: { timestamp: "asc" },
    });
    if (allVotes.length > 0) {
        const first = await awardBadgeByName(allVotes[0].userId, BADGE.FIRST_TO_VOTE);
        const last = await awardBadgeByName(allVotes[allVotes.length - 1].userId, BADGE.LAST_TO_VOTE);
        if (first) awarded.push(first);
        if (last) awarded.push(last);
    }

    const counts = options.map((o) => ({ id: o.id, count: o.votes.length }));
    const max = Math.max(...counts.map((c) => c.count));
    const winners = counts.filter((c) => c.count === max).map((c) => c.id);
    const isTie = winners.length > 1;

    if (isTie) {
        const voterIds = Array.from(new Set(allVotes.map((v) => v.userId)));
        for (const uid of voterIds) {
            const id = await awardBadgeByName(uid, BADGE.CLUTCH);
            if (id) awarded.push(id);
        }
    }

    for (const o of options) {
        if (o.votes.length === 1) {
            const id = await awardBadgeByName(o.votes[0].userId, BADGE.CHAOS_AGENT);
            if (id) awarded.push(id);
        }
    }

    return Array.from(new Set(awarded));
}
