import { z } from "zod";
import { auth } from "@/auth";
import { requireSceneAccess } from "@/server/scene-access";
import { prisma } from "@/lib/prisma";
import { checkpointSceneDocument } from "@/lib/storyworld/local-first/y-sync-server";

const inputSchema = z.object({ branchId: z.string().min(1).optional(), sequence: z.number().int().nonnegative(), source: z.enum(["AUTOSAVE", "MANUAL", "BRANCH_FORK", "MERGE"]).default("AUTOSAVE") });

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; sceneId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, sceneId } = await params;
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: { code: "INVALID_CHECKPOINT", message: "Checkpoint request is invalid" } }, { status: 400 });
  try {
    await requireSceneAccess(session.user.id, projectId, sceneId, ["OWNER", "WRITER", "EDITOR"]);
    if (parsed.data.branchId) {
      const branch = await prisma.canonBranch.findFirst({ where: { id: parsed.data.branchId, universe: { seriesId: projectId } }, select: { id: true } });
      if (!branch) return Response.json({ error: { code: "BRANCH_NOT_FOUND", message: "Branch not found" } }, { status: 404 });
    }
    const checkpoint = await checkpointSceneDocument({ sceneId, branchId: parsed.data.branchId, sequence: parsed.data.sequence, source: parsed.data.source, userId: session.user.id });
    return Response.json({ checkpointId: checkpoint.id, sequence: checkpoint.sequence }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "STALE_SCENE") {
      const currentSequence = "currentSequence" in error && typeof error.currentSequence === "number" ? error.currentSequence : undefined;
      return Response.json({ error: { code: "STALE_SCENE", message: "The scene changed before the checkpoint was created" }, currentSequence }, { status: 409 });
    }
    return Response.json({ error: { code: "CHECKPOINT_FAILED", message: "Checkpoint creation failed" } }, { status: 500 });
  }
}
