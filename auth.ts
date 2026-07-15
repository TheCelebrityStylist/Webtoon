import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const credentials = z.object({ email: z.string().email(), password: z.string().min(8) });
const providers:Provider[]=[Credentials({ credentials: { email: {}, password: {} }, async authorize(raw) {
    const parsed = credentials.safeParse(raw); if (!parsed.success) return null;
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() }, include: { profile: true } });
    if (!user || !(await compare(parsed.data.password, user.passwordHash))) return null;
    return { id: user.id, email: user.email, name: user.profile?.displayName ?? undefined };
  } })];if(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET)providers.push(Google({clientId:process.env.GOOGLE_CLIENT_ID,clientSecret:process.env.GOOGLE_CLIENT_SECRET,authorization:{params:{scope:"openid email profile"}}}));
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers,
  callbacks: {
    async signIn({user,account}){if(account?.provider==="google"&&user.email){const email=user.email.toLowerCase();const existing=await prisma.user.findUnique({where:{email}});if(existing){user.id=existing.id}else{const created=await prisma.user.create({data:{email,passwordHash:await import("bcryptjs").then(({hash})=>hash(crypto.randomUUID(),12)),profile:{create:{displayName:user.name??email.split("@")[0]}},memberships:{create:{role:"OWNER",workspace:{create:{name:`${user.name??"Writer"}'s studio`}}}}}});user.id=created.id}}return true},
    jwt({ token, user }) { if (user?.id) token.sub = user.id; return token; },
    session({ session, token }) { if (session.user && token.sub) session.user.id = token.sub; return session; },
  },
});
