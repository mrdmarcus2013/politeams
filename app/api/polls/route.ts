import { NextRequest, NextResponse } from "next/server";

// Example poll — replace with DB later
const activePoll = {
  id: "poll-001",
  question: "What should the government focus on next year?",
  options: [
    "Universal Healthcare",
    "Lower Taxes",
    "Climate Action",
    "Military Funding",
    "Technological Investment",
  ],
  startDate: "2025-07-20",
  endDate: "2025-07-22",
};

// In-memory vote storage (resets on server restart)
let voteCounts: number[] = new Array(activePoll.options.length).fill(0);
let userVotes: Record<string, number> = {}; // userId → option index

export async function GET(req: NextRequest) {
  // For PoC: always return today's poll
  return NextResponse.json({
    poll: activePoll,
    voteCounts,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, choiceIndex } = body;

    if (
      typeof userId !== "string" ||
      typeof choiceIndex !== "number" ||
      choiceIndex < 0 ||
      choiceIndex >= activePoll.options.length
    ) {
      return NextResponse.json({ error: "Invalid vote data" }, { status: 400 });
    }

    if (userVotes[userId] !== undefined) {
      return NextResponse.json({ error: "User already voted" }, { status: 403 });
    }

    voteCounts[choiceIndex]++;
    userVotes[userId] = choiceIndex;

    return NextResponse.json({
      message: "Vote recorded",
      voteCounts,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}
