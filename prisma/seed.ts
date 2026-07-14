import { PrismaClient, WorkspaceRole, Genre } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Seed is disabled in production.");
  const passwordHash = await hash("StudioDemo!2026", 12);
  await prisma.user.upsert({ where: { email: "demo@localhost.test" }, update: {}, create: { email: "demo@localhost.test", passwordHash, profile: { create: { displayName: "Demo Creator" } }, memberships: { create: { role: WorkspaceRole.OWNER, workspace: { create: { name: "Demo Studio", series: { create: { title: "The Glass Harbour", slug: "the-glass-harbour", logline: "A cartographer discovers that every map she finishes erases a place from memory.", synopsis: "A deliberately labelled local seed project for exercising the creator workflow.", genre: Genre.FANTASY, language: "en", audience: "Young adult fantasy readers" } } } } } } } });
}
main().finally(() => prisma.$disconnect());
