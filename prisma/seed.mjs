// prisma/seed.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const RANKS = [
  { id: 1, title: "Junior City Council Member", minVotes: 0, description: "You have no power, no office, and no idea how you got elected." },
  { id: 2, title: "City Council Member", minVotes: 2, description: "You now have a say in pothole placement and local squirrel ordinances." },
  { id: 3, title: "Deputy Mayor", minVotes: 5, description: "You're technically in charge if the mayor “goes missing” So... any plans?" },
  { id: 4, title: "Mayor", minVotes: 8, description: "You run this town. Or at least, you run its monthly newsletter." },
  { id: 5, title: "State Representative", minVotes: 12, description: "You represent thousands of people who've never heard of you." },
  { id: 6, title: "State Senator", minVotes: 19, description: "You wear suits now. Bad ones. Funded by questionable donations." },
  { id: 7, title: "Lieutenant Governor", minVotes: 29, description: "You're one heartbeat away from actual relevance. Try not to get too excited." },
  { id: 8, title: "Governor", minVotes: 41, description: "You control National Guard deployments and high school football morale." },
  { id: 9, title: "Congressperson", minVotes: 54, description: "You fight for your constituents by yelling on social media." },
  { id: 10, title: "U.S. Senator", minVotes: 71, description: "You're important. Or at least, you believe that deeply." },
  { id: 11, title: "House Majority Whip", minVotes: 91, description: "You keep everyone in line. With candy, threats, or both." },
  { id: 12, title: "Speaker of the House", minVotes: 115, description: "You control the floor. Mostly just to trip people." },
  { id: 13, title: "Vice President", minVotes: 142, description: "You're here for balance. And funerals. Mostly funerals." },
  { id: 14, title: "President", minVotes: 172, description: "You're the leader of the free world. Or at least this leaderboard." },
  { id: 15, title: "Supreme Court Justice", minVotes: 205, description: "You wear robes and judge silently. Mostly for the vibe." },
  { id: 16, title: "Shadow President", minVotes: 241, description: "You pull the strings. Or at least believe you do." },
  { id: 17, title: "Galactic Senator", minVotes: 280, description: "Earth politics bored you. Now you legislate for alien races." },
  { id: 18, title: "Multiversal Chancellor", minVotes: 322, description: "You govern across dimensions. Your campaign ads are... weird." },
  { id: 19, title: "God-Emperor of Democracy", minVotes: 367, description: "Your reign is absolute. Your approval rating is not." },
  { id: 20, title: "Retired with Full Pension", minVotes: 415, description: "You've done your duty. Enjoy the beach and forget everything." },
];

// 🏅 Badges (from your list; emojis as placeholders; unlockHint = “How to Unlock”)
const BADGES = [
  { name: "First Vote", icon: "🗳️", unlockHint: "Cast your first vote", description: "You did it! You're now part of the problem." },
  { name: "Streak Starter", icon: "🔥", unlockHint: "Vote 3 days in a row", description: "The flame has been lit. Don’t blow it out." },
  { name: "Full Week Warrior", icon: "📅", unlockHint: "Vote 7 days in a row", description: "One week in. You’re either committed or lost." },
  { name: "Month of Mayhem", icon: "🧠", unlockHint: "Vote 30 days in a row", description: "30 straight days of opinions. Are you okay?" },
  { name: "Underdog Voter", icon: "🐢", unlockHint: "Vote for a losing option 10 times", description: "You support the little guys. Even when they're wrong." },
  { name: "Trend Rider", icon: "🏄", unlockHint: "Vote for the winning option 10 times", description: "You're either psychic or a sheep." },
  { name: "Midnight Maverick", icon: "🌙", unlockHint: "Vote between 12–1am", description: "You vote when the freaks come out." },
  { name: "First to Vote", icon: "⚡", unlockHint: "Be the first voter on any poll", description: "Fastest draw in the democracy." },
  { name: "Last to Vote", icon: "🐌", unlockHint: "Be the last voter on a poll", description: "We waited all day for this?" },
  { name: "Clutch Voter", icon: "🧨", unlockHint: "Vote in a poll that ends in a tie", description: "You had one job…" },
  { name: "Chaos Agent", icon: "🃏", unlockHint: "Be the only voter for a poll option", description: "Statistically impressive. Or sabotage." },
  { name: "Streak Slayer", icon: "🪦", unlockHint: "Break a 10+ day streak", description: "RIP your discipline." },
  { name: "Ballot Beast", icon: "🦁", unlockHint: "Cast 100 total votes", description: "You hunger for democracy." },
  { name: "Mega Influencer", icon: "📣", unlockHint: "Vote on 10+ polls that had 100+ total votes", description: "Clearly your opinion matters." },
  { name: "Quiet Power", icon: "👻", unlockHint: "Vote 50 times without ever commenting", description: "A silent force of nature." },
  { name: "Overachiever", icon: "🎓", unlockHint: "Earn all other badges", description: "Your therapist is concerned." },
];

const TEAM_DISTRIBUTION = [
  { slug: "left", count: 7 },
  { slug: "right", count: 6 },
  { slug: "center", count: 5 },
  { slug: "progressive", count: 4 },
  { slug: "libertarian", count: 3 },
  { slug: "environmentalist", count: 2 },
  { slug: "technocrat", count: 2 },
  { slug: "anarchist", count: 1 },
];

const TEAM_DATA = TEAM_DISTRIBUTION.map(({ slug }) => {
  const nicknameMap = {
    left: "Kraken",
    right: "Bulwark",
    center: "Navigators",
    progressive: "Blazers",
    libertarian: "Free Riders",
    environmentalist: "Guardians",
    technocrat: "Cyborgs",
    anarchist: "Marauders",
  };
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  return { slug, name, nickname: nicknameMap[slug] || name };
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function generateUsers(teamCounts) {
  const users = [];
  let id = 1;
  for (const { slug, count } of teamCounts) {
    for (let i = 0; i < count; i++) {
      users.push({
        name: `User${id}`,
        email: `user${id}@example.com`,
        password: "password123",
        teamSlug: slug,
      });
      id++;
    }
  }
  return users;
}
function sampleN(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

async function main() {
  console.log("🧹 Clearing existing data...");
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.option.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.rank.deleteMany();

  console.log("🏅 Seeding ranks...");
  for (const rank of RANKS) {
    await prisma.rank.create({ data: rank });
  }

  console.log("🎖️ Seeding badges...");
  await Promise.all(
    BADGES.map((b) =>
      prisma.badge.create({
        data: {
          name: b.name,
          icon: b.icon,
          description: b.description,
          unlockHint: b.unlockHint,
        },
      })
    )
  );
  const allBadges = await prisma.badge.findMany();
  const firstVoteBadge = allBadges.find((b) => b.name === "First Vote");
  const additionalBadgePool = allBadges.filter((b) => b.name !== "First Vote");

  console.log("🚧 Creating teams...");
  const teams = {};
  for (const team of TEAM_DATA) {
    const created = await prisma.team.create({ data: team });
    teams[team.slug] = created;
  }

  console.log("👤 Creating users...");
  const rawUsers = generateUsers(TEAM_DISTRIBUTION);
  const createdUsers = [];
  for (const raw of rawUsers) {
    const password = await bcrypt.hash(raw.password, 10);
    const user = await prisma.user.create({
      data: {
        name: raw.name,
        email: raw.email,
        password,
        teamId: teams[raw.teamSlug].id,
      },
    });
    createdUsers.push({ ...user, teamSlug: raw.teamSlug });
  }

  console.log("📅 Creating 30 polls and simulating votes...");
  const now = new Date();
  const polls = [];

  for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
    const start = new Date(now);
    start.setUTCDate(now.getUTCDate() - dayOffset);
    start.setUTCHours(4, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const poll = await prisma.poll.create({
      data: {
        question: `Poll from ${dayOffset} days ago`,
        startDate: start,
        endDate: end,
        closedAt: end,
        options: {
          create: ["A", "B", "C", "D"].map((text) => ({ text: `Option ${text}` })),
        },
      },
      include: { options: true },
    });
    polls.push(poll);
  }

  // ✅ today's poll
  const startToday = new Date();
  startToday.setUTCHours(4, 0, 0, 0);
  const endToday = new Date(startToday);
  endToday.setUTCDate(endToday.getUTCDate() + 1);

  await prisma.poll.create({
    data: {
      question: "What is your top concern today?",
      startDate: startToday,
      endDate: endToday,
      options: {
        create: [
          { text: "Economy" },
          { text: "Healthcare" },
          { text: "Education" },
          { text: "Environment" },
        ],
      },
    },
  });

  console.log("🗳️ Casting votes...");
  const userVoteCounts = {};
  for (const user of createdUsers) {
    const votesToCast = getRandomInt(15, 30);
    const voteDays = new Set();
    while (voteDays.size < votesToCast) {
      voteDays.add(getRandomInt(0, 29));
    }
    const days = Array.from(voteDays);
    days.sort((a, b) => a - b);
    let streak = 1;
    let maxStreak = 1;
    let lastVoteDate = null;

    for (let i = 0; i < days.length; i++) {
      const dayIndex = days[i];
      const poll = polls[dayIndex];
      const option = getRandomElement(poll.options);
      const timestamp = new Date(poll.startDate);
      timestamp.setUTCHours(12);

      await prisma.vote.create({
        data: {
          userId: user.id,
          optionId: option.id,
          timestamp,
        },
      });

      if (i > 0 && days[i] === days[i - 1] + 1) {
        streak++;
        if (streak > maxStreak) maxStreak = streak;
      } else {
        streak = 1;
      }

      lastVoteDate = timestamp;
    }

    const totalVotes = days.length;
    const eligibleRanks = RANKS.filter((r) => totalVotes >= r.minVotes);
    const bestRank = eligibleRanks.sort((a, b) => b.minVotes - a.minVotes)[0];

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalVotes,
        streakCount: maxStreak,
        lastVotedDate: lastVoteDate,
        rankId: bestRank?.id || 1,
      },
    });

    // 👇 Assign badges: always First Vote + 0–2 random others
    if (firstVoteBadge) {
      await prisma.userBadge.create({
        data: { userId: user.id, badgeId: firstVoteBadge.id },
      });
    }
    const extraCount = getRandomInt(0, 2);
    const extras = sampleN(additionalBadgePool, extraCount);
    for (const b of extras) {
      await prisma.userBadge.create({
        data: { userId: user.id, badgeId: b.id },
      });
    }

    userVoteCounts[user.teamSlug] = (userVoteCounts[user.teamSlug] || 0) + totalVotes;
  }

  console.log("📊 Updating team vote counts...");
  for (const [slug, count] of Object.entries(userVoteCounts)) {
    await prisma.team.update({
      where: { id: teams[slug].id },
      data: { totalVotes: count },
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
