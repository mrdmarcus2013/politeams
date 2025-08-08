import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";


export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user without assigning a team yet (they will complete onboarding quiz)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        teamId: null, // Onboarding will assign this
      },
    });

    // Return minimal user data for auto-login
    return NextResponse.json({
      message: "User created successfully",
      user: { email: newUser.email, password },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
