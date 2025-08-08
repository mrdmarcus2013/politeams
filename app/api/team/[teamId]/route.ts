import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";


export async function GET(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  const { teamId } = params;
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { name: true, nickname: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("❌ Error fetching team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
