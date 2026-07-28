import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string; entityId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, entityId } = await params;
  const search = new URL(request.url).searchParams;
  const branchId = search.get("branchId");
  const sequence = Number(search.get("sequence") ?? Number.MAX_SAFE_INTEGER);
  if (!branchId) return Response.json({ error: { code: "BRANCH_REQUIRED", message: "Choose a branch" } }, { status: 400 });
  try {
    const { universe } = await requireStoryworldBranch(session.user.id, projectId, branchId);
    const entity = await prisma.canonEntity.findFirst({ where: { id: entityId, universeId: universe.id, deletedAt: null }, select: { id: true, name: true, entityType: true } });
    if (!entity) return Response.json({ error: { code: "ENTITY_NOT_FOUND", message: "Story record not found" } }, { status: 404 });
    const projection = await prisma.canonProjection.findFirst({ where: { branchId, entityId, atManuscriptSequence: { lte: sequence } }, orderBy: { atManuscriptSequence: "desc" } });
    return Response.json({ entity, projection }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return storyworldError(error);
  }
}
