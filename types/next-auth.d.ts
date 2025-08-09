// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Role } from "@prisma/client";

// Augment NextAuth Session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;

      // ✅ Add what you actually use in code/callbacks:
      role?: Role;                     // <— you check session.user.role
      teamSlug?: string | null;        // <— you set this in callbacks

      // Keep existing optional team shape if you use it anywhere:
      teamId?: string | null;
      team?: {
        id: string;
        name: string;
        nickname: string | null;
      } | null;

      // Optional future field you referenced earlier:
      rank?: { title: string; description: string } | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    teamId?: string | null;
    role?: Role; // Optional here if you read it off the DB user sometimes
  }
}

// Augment JWT types to mirror what you store in callbacks
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;

    role?: Role;
    teamSlug?: string | null;

    teamId?: string | null;
    team?: {
      id: string;
      name: string;
      nickname: string | null;
    } | null;

    rank?: { title: string; description: string } | null;
  }
}

// Ensure this file is treated as a module
export { };
