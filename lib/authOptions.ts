// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { team: true, rank: true }, // 👈 load rank here
                });
                if (!user || !user.password) return null;
                const ok = await bcrypt.compare(credentials.password, user.password);
                return ok ? user : null;
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: "/auth" },

    callbacks: {
        async jwt({ token, user, trigger }) {
            // Initial sign-in: copy fields from `user`
            if (user) {
                token.id = (user as any).id ?? token.sub;
                token.email = user.email ?? token.email;
                token.teamSlug = (user as any).team?.slug ?? null;
                token.role = (user as any).role;

                const uRank = (user as any).rank as
                    | { title: string; description: string }
                    | null
                    | undefined;
                if (uRank) {
                    token.rank = { title: uRank.title, description: uRank.description };
                }
            }

            // Refresh derived fields if missing/outdated
            if (
                trigger === "update" ||
                token.teamSlug === undefined ||
                token.role === undefined ||
                token.rank === undefined
            ) {
                const fresh = await prisma.user.findUnique({
                    where: { id: ((token.id as string) ?? (token.sub as string))! },
                    include: { team: true, rank: true }, // 👈 ensure rank is fetched
                });
                if (fresh) {
                    token.teamSlug = fresh.team?.slug ?? null;
                    token.role = fresh.role;
                    token.rank = fresh.rank
                        ? { title: fresh.rank.title, description: fresh.rank.description }
                        : null;
                }
            }

            return token;
        },

        async session({ session, token }) {
            // Shape the session the app expects
            session.user = {
                id: ((token.id as string) ?? (token.sub as string))!,
                email: (token.email as string) ?? "",
                teamSlug: (token as any).teamSlug ?? null,
                role: (token as any).role,
                rank: (token as any).rank ?? null, // 👈 expose rank on session
            } as any;

            return session;
        },
    },
};
