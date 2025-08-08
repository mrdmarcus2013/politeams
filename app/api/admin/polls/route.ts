import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";


/**
 * GET: List all polls (with options & votes)
 */
export async function GET() {
  const polls = await prisma.poll.findMany({
    include: {
      options: {
        include: { votes: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ polls });
}

/**
 * POST: Create a new poll
 * - Requires question and at least 2 options
 * - Enforces 1-day duration (endDate = startDate + 1 day)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, options, startDate } = await req.json();

  if (!question || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json(
      { error: "Question and at least 2 options are required" },
      { status: 400 }
    );
  }

  // Use provided startDate or today, enforce endDate = startDate + 1 day
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  const poll = await prisma.poll.create({
    data: {
      question,
      startDate: start,
      endDate: end,
      options: {
        create: options.map((opt: string) => ({ text: opt })),
      },
    },
  });

  return NextResponse.json(poll);
}

/**
 * PUT: Update poll (edit question/options, close, or undo-close)
 */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, data } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Poll ID required" }, { status: 400 });
  }

  // ✅ Close or Undo-Close poll
  if (data.closedAt !== undefined) {
    await prisma.poll.update({
      where: { id },
      data: { closedAt: data.closedAt ? new Date(data.closedAt) : null },
    });
    return NextResponse.json({
      message: data.closedAt ? "Poll closed" : "Poll reopened",
    });
  }

  // ✅ Edit question & options
  if (data.question && Array.isArray(data.options)) {
    const validOptions = data.options.filter((opt: string) => opt.trim());
    if (validOptions.length < 2) {
      return NextResponse.json(
        { error: "At least 2 valid options required" },
        { status: 400 }
      );
    }

    // Delete existing options and recreate
    await prisma.option.deleteMany({ where: { pollId: id } });

    const updatedPoll = await prisma.poll.update({
      where: { id },
      data: {
        question: data.question,
        options: {
          create: validOptions.map((opt: string) => ({ text: opt })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json(updatedPoll);
  }

  return NextResponse.json(
    { error: "No valid data to update" },
    { status: 400 }
  );
}

/**
 * DELETE: Permanently delete a poll and its options
 */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Poll ID required" }, { status: 400 });
  }

  await prisma.option.deleteMany({ where: { pollId: id } });
  await prisma.poll.delete({ where: { id } });

  return NextResponse.json({ message: "Poll deleted" });
}
