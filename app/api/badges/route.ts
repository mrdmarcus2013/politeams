import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic"; // ensure no static caching
export const revalidate = 0;            // disable ISR for this route



export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Not signed in → return empty list (200 is fine for client UX)
        if (!session?.user?.id) {
            return NextResponse.json(
                { badges: [] },
                { headers: { "Cache-Control": "no-store" } }
            );
        }

        const rows = await prisma.userBadge.findMany({
            where: { userId: session.user.id },
            include: { badge: true },
            orderBy: { earnedAt: "desc" },
        });

        const badges = rows.map((row) => ({
            id: row.badge.id,
            name: row.badge.name,
            icon: row.badge.icon,
            description: row.badge.description,
            unlockHint: row.badge.unlockHint,
            earnedAt: row.earnedAt,
        }));

        return NextResponse.json(
            { badges },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (e) {
        console.error("❌ /api/badges error:", e);
        return NextResponse.json(
            { badges: [] },
            { status: 500, headers: { "Cache-Control": "no-store" } }
        );
    }
}
