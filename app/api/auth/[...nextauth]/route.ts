import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, User as PrismaUser, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { prisma } from "@/app/lib/prisma";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



/**
 * === Extend JWT type ===
 * Add `role`, `teamSlug`, and `rank` to the JWT token payload.
 */
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    teamSlug?: string | null;
    role?: Role;
    rank?: {
      title: string;
      description: string;
    };
  }
}

/**
 * === Extend Session type ===
 * Make sure session exposes `role`, `teamSlug`, and `rank` in `session.user`.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      teamSlug: string | null;
      role: Role;
      rank?: {
        title: string;
        description: string;
      };
    };
  }
}

/**
 * === Auth Options ===
 * Define providers, session strategy, and callbacks.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
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
      async authorize(credentials): Promise<PrismaUser | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { team: true, rank: true }, // Include rank here
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
        token.rank = (user as any).rank
          ? {
            title: (user as any).rank.title,
            description: (user as any).rank.description,
          }
          : undefined;
        return token;
      }

      // Refresh session or missing values
      if (trigger === "update" || !token.teamSlug || !token.role || !token.rank) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          include: { team: true, rank: true }, // ✅ Include rank here too
        });

        if (dbUser) {
          token.teamSlug = dbUser.team?.slug ?? null;
          token.role = dbUser.role;
          token.rank = dbUser.rank
            ? {
              title: dbUser.rank.title,
              description: dbUser.rank.description,
            }
            : undefined;
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
        rank: token.rank,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
