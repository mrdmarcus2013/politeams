import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import type { RouteParams } from "@/app/types/route";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: RouteParams<"id">) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: commentId } = await ctx.params;

        await prisma.$transaction(async (tx) => {
            await tx.reaction.create({ data: { userId: session.user.id, commentId, kind: "like" } });
            await tx.comment.update({ where: { id: commentId }, data: { likeCount: { increment: 1 } } });

            const parent = await tx.comment.findUnique({ where: { id: commentId }, select: { threadId: true } });
            if (parent?.threadId) {
                await tx.thread.update({ where: { id: parent.threadId }, data: { likeCount: { increment: 1 } } });
            }
        });

        return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (e: any) {
        // Unique constraint → already liked
        if (e?.code === "P2002") return NextResponse.json({ ok: true }, { status: 200 });
        console.error("react POST error", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
