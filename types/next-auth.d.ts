import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the default Session object
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      teamId?: string | null;
      team?: {
        id: string;
        name: string;
        nickname: string | null;
      } | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    teamId?: string | null;
  }
}

// Extend the default JWT object
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    teamId?: string | null;
    team?: {
      id: string;
      name: string;
      nickname: string | null;
    } | null;
  }
}
