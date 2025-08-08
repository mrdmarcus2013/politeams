// scripts/addFuturePolls.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const futurePolls = [
  {
    question: "What should the Federal Reserve do at its July 29–30 meeting?",
    options: [
      "Keep rates unchanged at 4.25 %–4.50 %",
      "Cut rates by 25 bps",
      "Raise rates by 25 bps",
      "Announce a hold but signal future cuts",
      "Vote with a split decision",
    ],
  },
  {
    question:
      "With the Department of Education pausing loan forgiveness under IBR/SAVE plans, what should affected borrowers do?",
    options: [
      "Apply for an economic hardship deferment",
      "Switch from SAVE to IBR program",
      "Continue making reduced minimum payments",
      "Petition Congress or your representative",
      "Pause payments and wait for policy clarity",
    ],
  },
  {
    question: "How should Congress address the reinstated federal debt ceiling?",
    options: [
      "Raise it immediately without conditions",
      "Link any increase to specific spending cuts",
      "Use extraordinary measures to delay action",
      "Allow a short-term default as leverage",
      "Pass a bipartisan emergency funding bill",
    ],
  },
  {
    question:
      "Intel announced cutting ~25,000 jobs and mandating return‑to‑office by September. What’s your view?",
    options: [
      "Necessary to streamline and compete",
      "Harmful to employee morale and retention",
      "Signals a broader tech‑sector turnaround",
      "Short‑sighted cost‑cutting move",
      "Neutral—I’m not following Intel closely",
    ],
  },
  {
    question:
      "Which trade strategy makes most sense for the U.S. in its ongoing China tensions?",
    options: [
      "Maintain broad tariffs to protect U.S. industries",
      "Negotiate targeted agreements with allies (e.g., Vietnam)",
      "Lift tariffs to avoid retaliation and lower consumer prices",
      "Shift focus to regional trade pacts (e.g., US–EU deal)",
      "Combine modest tariffs with incentives for reshoring",
    ],
  },
  {
    question:
      "Investors are eyeing a potential U.S.–EU trade deal. What impact do you expect?",
    options: [
      "Strong boost to equity markets",
      "Minimal, given existing uncertainties",
      "Pressure on U.S. manufacturing to adapt",
      "Improved consumer price stability",
      "Limited impact until tariffs deadlines lapse",
    ],
  },
  {
    question:
      "Which driver is most likely behind this week’s gains in the S&P 500 and Nasdaq?",
    options: [
      "Optimism over trade deals",
      "Strong AI‑sector earnings",
      "Anticipation of stable Fed policy",
      "Tech‑sector margin‑debt trends",
      "Broader corporate earnings surprises",
    ],
  },
  {
    question: "Which economic indicator worries you most right now?",
    options: [
      "Inflation (CPI, PCE)",
      "Unemployment levels",
      "Wage stagnation",
      "Stock‑market volatility",
      "Housing‑price bubble",
    ],
  },
  {
    question: "Which issue will have the biggest impact on November’s midterm elections?",
    options: [
      "The state of the economy and jobs",
      "Student‑loan debt relief",
      "Immigration policy",
      "Climate‑change legislation",
      "Healthcare affordability",
    ],
  },
  {
    question: "What single policy would do most to ease U.S. inflation?",
    options: [
      "Reduce or eliminate tariffs on consumer goods",
      "Tighten monetary policy (raise rates)",
      "Cut federal spending/subsidies",
      "Institute wage‑and‑price controls",
      "Enhance competition through antitrust actions",
    ],
  },
];

async function main() {
  console.log("🗳️ Adding future polls...");

  const now = new Date();

  for (let i = 0; i < futurePolls.length; i++) {
    const poll = futurePolls[i];

    // Calculate start and end date
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + (i + 1)); // Schedule future polls one per day
    startDate.setUTCHours(4, 0, 0, 0); // Midnight EST (4 AM UTC)

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const createdPoll = await prisma.poll.create({
      data: {
        question: poll.question,
        startDate,
        endDate,
        options: {
          create: poll.options.map((opt) => ({ text: opt })),
        },
      },
      include: { options: true },
    });

    console.log(
      `✅ Poll created for ${startDate.toDateString()} (ID: ${createdPoll.id})`
    );
  }

  console.log("🎉 Done! 10 future polls added successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error adding future polls:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
