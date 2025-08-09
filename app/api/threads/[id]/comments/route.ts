import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import type { RouteParams } from "@/app/types/route";

export const dynamic = "force-dynamic";

// GET /api/threads/:id/comments
export async function GET(_req: Request, ctx: RouteParams<"id">) {
    const { id } = await ctx.params;

    const comments = await prisma.comment.findMany({
        where: { threadId: id, parentId: null, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
            id: true, content: true, isAnonymous: true, createdAt: true,
            likeCount: true, replyCount: true,
            user: { select: { id: true, name: true, team: { select: { slug: true } }, rank: { select: { title: true } } } },
        },
    });

    const safe = comments.map(c => c.isAnonymous
        ? { ...c, user: { id: null, name: "Anonymous", team: null, rank: null } }
        : c);

    return NextResponse.json({ comments: safe }, { headers: { "Cache-Control": "no-store" } });
}

// POST /api/threads/:id/comments
export async function POST(req: Request, ctx: RouteParams<"id">) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: threadId } = await ctx.params;
    const body = await req.json();
    const content = String(body?.content ?? "").trim();
    const isAnonymous = Boolean(body?.isAnonymous);
    const parentId = body?.parentId ?? null;

    if (!content) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

    const created = await prisma.$transaction(async (tx) => {
        const c = await tx.comment.create({
            data: { threadId, userId: session.user.id, content: content.slice(0, 2000), isAnonymous, parentId },
            select: { id: true },
        });

        await tx.thread.update({ where: { id: threadId }, data: { commentCount: { increment: 1 } } });
        if (parentId) await tx.comment.update({ where: { id: parentId }, data: { replyCount: { increment: 1 } } });

        return c;
    });

    return NextResponse.json({ id: created.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
