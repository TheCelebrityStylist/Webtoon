import type { NextAuthConfig } from "next-auth";
export const authConfig = { pages: { signIn: "/sign-in" }, providers: [] } satisfies NextAuthConfig;
