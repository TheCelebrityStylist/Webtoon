import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/server/authorization";

const inputSchema = z.object({ expectedVersion: z.number().int().nonnegative() });

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; commitId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, commitId } = await params;
  try {
    await requireProjectAccess(session.user.id, projectId);
    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid revert request" }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const universe = await tx.canonUniverse.findUnique({ where: { seriesId: projectId } });
      const commit = await tx.canonCommit.findFirst({ where: { id: commitId, universeId: universe?.id }, include: { items: true } });
      if (!universe || !commit) throw new Error("NOT_FOUND");
      if (commit.status === "REVERTED") return { canonVersion: universe.version, alreadyReverted: true };
      if (universe.version !== parsed.data.expectedVersion) throw new Error("CANON_VERSION_CONFLICT");
      const transitionIds = commit.items.map((item) => item.transitionId).filter((id): id is string => Boolean(id));
      await tx.canonTransition.updateMany({ where: { id: { in: transitionIds } }, data: { status: "REVERTED" } });
      await tx.canonMention.updateMany({ where: { entity: { universeId: universe.id }, revision: commit.expectedVersion }, data: { active: false } });
      await tx.canonCommit.update({ where: { id: commit.id }, data: { status: "REVERTED", revertedAt: new Date(), revertedById: session.user.id } });
      await tx.canonUniverse.update({ where: { id: universe.id }, data: { version: { increment: 1 } } });
      return { canonVersion: universe.version + 1, alreadyReverted: false };
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Revert failed";
    return Response.json({ error: message }, { status: message === "CANON_VERSION_CONFLICT" ? 409 : 404 });
  }
}
