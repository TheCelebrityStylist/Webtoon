import type { NextAuthConfig } from "next-auth";
export const authConfig = {
  pages: { signIn: "/sign-in", error: "/sign-in" },
  providers: [],
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
