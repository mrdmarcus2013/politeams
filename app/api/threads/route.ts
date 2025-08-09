import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import type { ThreadType, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_TYPES: ThreadType[] = ["POLL", "TOPIC", "FEEDBACK"];
const VALID_SORT = new Set(["newest", "popular", "title"]);

/**
 * GET /api/threads?type=POLL|TOPIC|FEEDBACK&sort=newest|popular|title&pollId=xyz
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const typeRaw = searchParams.get("type");
    const sortRaw = searchParams.get("sort");
    const pollId = searchParams.get("pollId");

    const where: Prisma.ThreadWhereInput = {};
    if (typeRaw && (VALID_TYPES as string[]).includes(typeRaw)) {
        where.type = typeRaw as ThreadType;
    }
    if (pollId) {
        where.pollId = pollId;
        where.type = "POLL"; // ensure it only returns poll threads for that poll
    }

    // Default: newest
    let orderBy: Prisma.ThreadOrderByWithRelationInput = { createdAt: "desc" };
    const sort = sortRaw && VALID_SORT.has(sortRaw) ? sortRaw : "newest";
    if (sort === "popular") orderBy = { likeCount: "desc" };
    if (sort === "title") orderBy = { title: "asc" };

    const threads = await prisma.thread.findMany({
        where,
        orderBy,
        take: 50,
        select: {
            id: true,
            title: true,
            type: true,
            pollId: true,
            commentCount: true,
            likeCount: true,
            createdAt: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    team: { select: { slug: true } },
                    rank: { select: { title: true } },
                },
            },
        },
    });

    return NextResponse.json({ threads });
}

/**
 * POST /api/threads — create a thread
 * body: { title: string, type: ThreadType, pollId?: string }
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const type = body?.type as ThreadType | undefined;
    const pollId: string | null = body?.pollId ?? null;

    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!type || !(VALID_TYPES as string[]).includes(type)) {
        return NextResponse.json({ error: "Valid type required" }, { status: 400 });
    }
    if (type === "POLL" && !pollId) {
        return NextResponse.json({ error: "pollId required for POLL threads" }, { status: 400 });
    }

    const created = await prisma.thread.create({
        data: {
            title: title.slice(0, 200),
            type,
            pollId,
            createdById: session.user.id,
        },
        select: { id: true },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
}
