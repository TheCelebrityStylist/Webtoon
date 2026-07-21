import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireSceneAccess } from "@/server/scene-access";

const inputSchema = z.object({ proposalIds: z.array(z.string()).min(1).max(50), reason: z.string().max(500).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; sceneId: string; runId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, sceneId, runId } = await params;
  try {
    await requireSceneAccess(session.user.id, projectId, sceneId, ["OWNER", "WRITER", "EDITOR"]);
    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid rejection request" }, { status: 400 });
    const result = await prisma.canonProposal.updateMany({ where: { runId, id: { in: parsed.data.proposalIds }, run: { sceneId } }, data: { status: "REJECTED", resolutionNote: parsed.data.reason, resolvedAt: new Date() } });
    return Response.json({ rejected: result.count });
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
}
