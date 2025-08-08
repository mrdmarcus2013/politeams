import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";


export async function POST(req: Request) {
  try {
    const { name, email, password, checkOnly } = await req.json();

    if (!name || name.length < 3) {
      return NextResponse.json({ error: "Invalid username." }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    // If just checking, respond with 200 or 409
    if (checkOnly) {
      if (existingUser) {
        return NextResponse.json({ error: "Username taken." }, { status: 409 });
      }
      return NextResponse.json({ message: "Username available." }, { status: 200 });
    }

    // If we're creating a new user
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password." }, { status: 400 });
    }

    if (existingUser) {
      return NextResponse.json({ error: "Username already taken." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Fetch starting rank (level 1)
    const startingRank = await prisma.rank.findFirst({
      where: { id: 1 },
    });

    if (!startingRank) {
      return NextResponse.json({ error: "No starting rank found." }, { status: 500 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        rankId: startingRank.id, // 🔹 Assign Rank 1
      },
    });

    return NextResponse.json({ user: { email: newUser.email, password } });
  } catch (error) {
    console.error("❌ Error in signup route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
