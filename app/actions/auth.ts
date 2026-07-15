"use server";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { resolveLocale } from "@/lib/i18n";
import { signIn, signOut } from "@/auth";

export type FormState = { error?: string; success?: string; fields?: Record<string, string[]> };
const signUpInput = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), password: z.string().min(12).regex(/[A-Z]/).regex(/[0-9]/),interfaceLocale:z.enum(["en","nl","de","es","pt"]) });
export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the highlighted fields.", fields: parsed.error.flatten().fieldErrors };
  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return { error: "An account already exists for this email." };
  await prisma.user.create({ data: { email, passwordHash: await hash(parsed.data.password, 12), profile: { create: { displayName: parsed.data.name,interfaceLocale:parsed.data.interfaceLocale } }, memberships: { create: { role: "OWNER", workspace: { create: { name: `${parsed.data.name}'s studio` } } } } } });
  (await cookies()).set("interface-locale",resolveLocale(parsed.data.interfaceLocale),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production"});
  await signIn("credentials", { email, password: parsed.data.password, redirectTo: "/studio" });
  return {};
}
export async function signInAction(_: FormState, formData: FormData): Promise<FormState> {
  try { await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirectTo: "/studio" }); }
  catch (error) { if (error instanceof AuthError) return { error: "Email or password is incorrect." }; throw error; }
  return {};
}
export async function signOutAction() { await signOut({ redirectTo: "/" }); }
export async function signInGoogle(){await signIn("google",{redirectTo:"/studio"})}
