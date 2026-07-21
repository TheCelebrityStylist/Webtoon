import { auth } from "@/auth";
import { canonAt } from "@/lib/canon/repository";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/server/authorization";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  try {
    await requireProjectAccess(session.user.id, projectId);
    const url = new URL(request.url);
    const sequence = Number(url.searchParams.get("sequence") ?? Number.MAX_SAFE_INTEGER);
    const context = await canonAt(projectId, sequence);
    const mentions = await prisma.canonMention.findMany({ where: { entity: { universeId: context.universe.id }, active: true }, orderBy: { createdAt: "desc" }, take: 100, select: { entityId: true, sceneId: true, blockId: true, quote: true, startOffset: true, endOffset: true, revision: true } });
    return Response.json({ canonVersion: context.universe.version, sequence, world: context.world, sources: mentions }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
}
