// lib/authOptions.ts
import NextAuth, { NextAuthOptions } from "next-auth";
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
                    include: { team: true },
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
            if (user) {
                token.id = (user as any).id;
                token.email = user.email ?? "";
                token.teamSlug = (user as any).team?.slug ?? null;
                token.role = (user as any).role;
            }
            if (trigger === "update" || !token.teamSlug || !token.role) {
                const fresh = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    include: { team: true },
                });
                if (fresh) {
                    token.teamSlug = fresh.team?.slug ?? null;
                    token.role = fresh.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            session.user = {
                id: token.id as string,
                email: token.email as string,
                teamSlug: (token as any).teamSlug ?? null,
                role: (token as any).role,
            } as any;
            return session;
        },
    },
};
