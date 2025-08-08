import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check user authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamSlug } = await req.json();

    // Validate input
    if (!teamSlug) {
      return NextResponse.json(
        { error: "teamSlug is required" },
        { status: 400 }
      );
    }

    // Find team by slug
    const team = await prisma.team.findUnique({
      where: { slug: teamSlug },
      select: { id: true, slug: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Invalid team" }, { status: 400 });
    }

    // Update user with team
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { teamId: team.id },
      select: { id: true, email: true, teamId: true },
    });

    // ✅ Return updated user and teamSlug for the client
    return NextResponse.json({
      message: "Team updated successfully",
      teamSlug: team.slug,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
