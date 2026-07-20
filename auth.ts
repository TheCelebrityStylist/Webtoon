import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { getAuthAvailability, PREVIEW_DEMO_USER_ID } from "@/lib/runtime-config";
import { logServerError } from "@/lib/server-log";

const credentials = z.object({ email: z.string().email(), password: z.string().min(8) });
const availability = getAuthAvailability();
const providers: Provider[] = [];
if (availability.databaseConfigured) providers.push(Credentials({ id: "credentials", name: "Email and password", credentials: { email: {}, password: {} }, async authorize(raw) {
  const parsed = credentials.safeParse(raw); if (!parsed.success) return null;
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() }, include: { profile: true } });
    if (!user || !(await compare(parsed.data.password, user.passwordHash))) return null;
    return { id: user.id, email: user.email, name: user.profile?.displayName ?? undefined };
  } catch (error) {
    logServerError("auth.credentials.database_unavailable", error);
    throw new Error("DATABASE_UNAVAILABLE");
  }
}}));
if (availability.previewDemoEnabled) providers.push(Credentials({ id: "preview-demo", name: "Preview demo", credentials: {}, async authorize() {
  return { id: PREVIEW_DEMO_USER_ID, email: "preview@morrow.local", name: "Preview writer" };
} }));
if (availability.googleConfigured) providers.push(Google({clientId:process.env.GOOGLE_CLIENT_ID!,clientSecret:process.env.GOOGLE_CLIENT_SECRET!,authorization:{params:{scope:"openid email profile"}}}));
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers,
  callbacks: {
    async signIn({user,account}){if(account?.provider==="google"&&user.email){if(!availability.databaseConfigured)return false;try{const email=user.email.toLowerCase();const existing=await prisma.user.findUnique({where:{email}});if(existing){user.id=existing.id}else{const created=await prisma.user.create({data:{email,passwordHash:await import("bcryptjs").then(({hash})=>hash(crypto.randomUUID(),12)),profile:{create:{displayName:user.name??email.split("@")[0]}},memberships:{create:{role:"OWNER",workspace:{create:{name:`${user.name??"Writer"}'s studio`}}}}}});user.id=created.id}}catch(error){logServerError("auth.google.database_unavailable",error);return false}}return true},
    jwt({ token, user }) { if (user?.id) token.sub = user.id; return token; },
    session({ session, token }) { if (session.user && token.sub) session.user.id = token.sub; return session; },
  },
});
