import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/server/authorization";

export async function requireStoryworldAccess(userId: string, projectId: string, roles?: Array<"OWNER" | "WRITER" | "EDITOR">) {
  await requireProjectAccess(userId, projectId, roles);
  const universe = await prisma.canonUniverse.findUnique({ where: { seriesId: projectId }, select: { id: true } });
  if (!universe) throw Object.assign(new Error("Storyworld not found"), { code: "STORYWORLD_NOT_FOUND", status: 404 });
  return universe;
}

export async function requireStoryworldBranch(userId: string, projectId: string, branchId: string, roles?: Array<"OWNER" | "WRITER" | "EDITOR">) {
  const universe = await requireStoryworldAccess(userId, projectId, roles);
  const branch = await prisma.canonBranch.findFirst({ where: { id: branchId, universeId: universe.id } });
  if (!branch) throw Object.assign(new Error("Branch not found"), { code: "BRANCH_NOT_FOUND", status: 404 });
  return { universe, branch };
}

export function storyworldError(error: unknown) {
  const code = error instanceof Error && "code" in error ? String(error.code) : "STORYWORLD_FAILED";
  const status = error instanceof Error && "status" in error && typeof error.status === "number" ? error.status : code.includes("NOT_FOUND") ? 404 : code.includes("STALE") ? 409 : 500;
  const messages: Record<string, string> = {
    STORYWORLD_NOT_FOUND: "Storyworld not found",
    BRANCH_NOT_FOUND: "Branch not found",
    CHECKPOINT_NOT_FOUND: "Checkpoint not found",
    STALE_BRANCH: "The branch changed before this operation completed",
  };
  return Response.json({ error: { code, message: messages[code] ?? "Storyworld operation failed" } }, { status });
}
