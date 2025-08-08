import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";



/**
 * GET: Fetch all onboarding answers with user info
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const answers = await prisma.onboardingAnswer.findMany({
    include: {
      user: {
        select: { id: true, email: true, teamId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ answers });
}
