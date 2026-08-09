import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; entityId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to continue" } },
      { status: 401 },
    );
  const { projectId, entityId } = await params;
  const search = new URL(request.url).searchParams;
  const branchId = search.get("branchId");
  const sequence = Number(search.get("sequence") ?? Number.MAX_SAFE_INTEGER);
  if (!branchId)
    return Response.json(
      { error: { code: "BRANCH_REQUIRED", message: "Choose a branch" } },
      { status: 400 },
    );
  try {
    const { universe } = await requireStoryworldBranch(
      session.user.id,
      projectId,
      branchId,
    );
    const entity = await prisma.canonEntity.findFirst({
      where: { id: entityId, universeId: universe.id, deletedAt: null },
      select: { id: true, name: true, entityType: true },
    });
    if (!entity)
      return Response.json(
        {
          error: {
            code: "ENTITY_NOT_FOUND",
            message: "Story record not found",
          },
        },
        { status: 404 },
      );
    const [projection, references, event] = await Promise.all([
      prisma.canonProjection.findFirst({
        where: { branchId, entityId, atManuscriptSequence: { lte: sequence } },
        orderBy: { atManuscriptSequence: "desc" },
      }),
      prisma.canonEntity.findMany({
        where: { universeId: universe.id, deletedAt: null },
        select: { id: true, name: true },
      }),
      prisma.canonEvent.findFirst({
        where: {
          branchId,
          manuscriptSequence: { lte: sequence },
          OR: [{ subjectEntityId: entityId }, { objectEntityId: entityId }],
          status: { in: ["CONFIRMED", "INTENTIONAL_EXCEPTION"] },
        },
        orderBy: [{ manuscriptSequence: "desc" }, { createdAt: "desc" }],
        select: { evidence: true, sourceSceneId: true },
      }),
    ]);
    const evidence = Array.isArray(event?.evidence)
      ? event.evidence.map((item) => ({
          ...(typeof item === "object" && item ? item : {}),
          sceneId:
            typeof item === "object" && item && "sceneId" in item
              ? item.sceneId
              : event.sourceSceneId,
        }))
      : [];
    return Response.json(
      {
        entity,
        projection,
        references: Object.fromEntries(
          references.map((item) => [item.id, item.name]),
        ),
        evidence,
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    return storyworldError(error);
  }
}
