// lib/authOptions.ts

import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, Role } from "@prisma/client";
import { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();

// 🔐 Extend JWT type
declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        email?: string;
        teamSlug?: string | null;
        role?: Role;
    }
}

// 🔐 Extend Session type
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            teamSlug: string | null;
            role: Role;
        };
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<any | null> {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { team: true },
                });

                if (!user || !user.password) return null;
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return user;
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth",
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.email = user.email ?? "";
                token.teamSlug = (user as any).team?.slug ?? null;
                token.role = (user as any).role;
                return token;
            }

            if (trigger === "update" || !token.teamSlug || !token.role) {
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    include: { team: true },
                });

                if (freshUser) {
                    token.teamSlug = freshUser.team?.slug ?? null;
                    token.role = freshUser.role;
                }
            }

            return token;
        },

        async session({ session, token }): Promise<Session> {
            session.user = {
                id: token.id as string,
                email: token.email as string,
                teamSlug: token.teamSlug ?? null,
                role: token.role as Role,
            };
            return session;
        },
    },
};
