import { z } from "zod";
import { auth } from "@/auth";
import { applyProposalRun } from "@/lib/canon/apply-proposals";
import { prisma } from "@/lib/prisma";
import { requireSceneAccess } from "@/server/scene-access";

const inputSchema = z.object({
  revision: z.number().int().nonnegative(),
  manuscriptHash: z.string().length(64),
  expectedVersion: z.number().int().nonnegative(),
  proposalIds: z.array(z.string()).min(1).max(50),
});

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; sceneId: string; runId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, sceneId, runId } = await params;
  try {
    await requireSceneAccess(session.user.id, projectId, sceneId, ["OWNER", "WRITER", "EDITOR"]);
    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid confirmation request", details: parsed.error.flatten() }, { status: 400 });
    const result = await prisma.$transaction((tx) => applyProposalRun(tx, { ...parsed.data, runId, seriesId: projectId, sceneId, userId: session.user.id }));
    return Response.json(result, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Confirmation failed";
    const status = message === "STALE_REVISION" || message === "CANON_VERSION_CONFLICT" ? 409 : 400;
    return Response.json({ error: message }, { status });
  }
}
