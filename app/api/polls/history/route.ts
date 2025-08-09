import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/polls/history?limit=500
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitParam) ? Math.min(limitParam, 1000) : 500;

    const polls = await prisma.poll.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, question: true, createdAt: true },
    });

    return NextResponse.json({ polls });
}
