import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";

const entityNodeType = (value: string) => {
  const type = value.toLowerCase();
  if (type.includes("person") || type.includes("character")) return "person";
  if (type.includes("place") || type.includes("location")) return "place";
  if (type.includes("question")) return "question";
  if (type.includes("event")) return "event";
  return "object";
};

const edgeType = (eventType: string) => {
  if (eventType.includes("KNOW") || eventType.includes("LEARNS"))
    return "knows";
  if (eventType.includes("BELIEVES")) return "believes";
  if (eventType.includes("REVEAL")) return "reveals";
  if (eventType.includes("SETUP")) return "sets-up";
  if (eventType.includes("PAYOFF")) return "pays-off";
  if (eventType.includes("ACQUIRED") || eventType.includes("TRANSFERRED"))
    return "holds";
  if (eventType.includes("LOCATION") || eventType.includes("MOVED"))
    return "located-at";
  return "causes";
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; branchId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to continue" } },
      { status: 401 },
    );
  const { projectId, branchId } = await params;
  const requested = Number(
    new URL(request.url).searchParams.get("sequence") ??
      Number.MAX_SAFE_INTEGER,
  );
  const sequence = Number.isFinite(requested)
    ? requested
    : Number.MAX_SAFE_INTEGER;
  try {
    const { universe } = await requireStoryworldBranch(
      session.user.id,
      projectId,
      branchId,
    );
    const [chapters, entities, events, diagnostics, projections] =
      await Promise.all([
        prisma.chapter.findMany({
          where: { seriesId: projectId, deletedAt: null },
          orderBy: { number: "asc" },
          include: {
            scenes: {
              where: { deletedAt: null },
              orderBy: { position: "asc" },
              select: { id: true, title: true, position: true },
            },
          },
        }),
        prisma.canonEntity.findMany({
          where: { universeId: universe.id, deletedAt: null },
          orderBy: { name: "asc" },
        }),
        prisma.canonEvent.findMany({
          where: {
            branchId,
            manuscriptSequence: { lte: sequence },
            status: { in: ["CONFIRMED", "INTENTIONAL_EXCEPTION"] },
          },
          orderBy: [{ manuscriptSequence: "asc" }, { createdAt: "asc" }],
        }),
        prisma.canonDiagnostic.findMany({
          where: { branchId, status: "OPEN" },
          orderBy: { createdAt: "asc" },
        }),
        prisma.canonProjection.findMany({
          where: { branchId, atManuscriptSequence: { lte: sequence } },
          orderBy: { atManuscriptSequence: "desc" },
          distinct: ["entityId", "projectionType"],
        }),
      ]);

    const nodes: Array<Record<string, unknown>> = [];
    const edges: Array<Record<string, unknown>> = [];
    const chapterX = new Map<string, number>();
    const sceneIds = new Set<string>();
    chapters.forEach((chapter, chapterIndex) => {
      const x = 80 + chapterIndex * 560;
      chapterX.set(chapter.id, x);
      nodes.push({
        id: `chapter:${chapter.id}`,
        type: "chapter",
        label: chapter.title,
        detail: `Chapter ${chapter.number}`,
        meta: `${chapter.scenes.length} scenes`,
        x,
        y: 220,
        width: 500,
        height: 320,
      });
      chapter.scenes.forEach((scene, sceneIndex) => {
        sceneIds.add(scene.id);
        nodes.push({
          id: `scene:${scene.id}`,
          type: "scene",
          label: scene.title,
          detail: `Scene ${scene.position + 1}`,
          meta: chapter.title,
          sourceSceneId: scene.id,
          x: x + 30 + sceneIndex * 220,
          y: 330,
          width: 190,
          height: 100,
        });
        edges.push({
          id: `chapter-scene:${scene.id}`,
          source: `chapter:${chapter.id}`,
          target: `scene:${scene.id}`,
          type: "appears-in",
          label: "contains",
        });
      });
    });
    entities.forEach((entity, index) => {
      const type = entityNodeType(entity.entityType);
      const related = events.find(
        (event) =>
          event.subjectEntityId === entity.id ||
          event.objectEntityId === entity.id,
      );
      const sceneId = related?.sourceSceneId ?? undefined;
      const scene = chapters
        .flatMap((chapter) =>
          chapter.scenes.map((item) => ({ ...item, chapterId: chapter.id })),
        )
        .find((item) => item.id === sceneId);
      const baseX = scene ? (chapterX.get(scene.chapterId) ?? 80) : 80;
      const row = type === "person" ? 70 : type === "place" ? 590 : 720;
      nodes.push({
        id: `entity:${entity.id}`,
        type,
        label: entity.name,
        detail: entity.entityType.replaceAll("_", " ").toLowerCase(),
        meta: related ? "Established in the manuscript" : "Story record",
        sourceSceneId: sceneId,
        x: baseX + 40 + (index % 4) * 150,
        y: row + Math.floor(index / 4) * 110,
        width: 140,
        height: 76,
      });
    });
    events.forEach((event) => {
      const source = event.subjectEntityId
        ? `entity:${event.subjectEntityId}`
        : event.sourceSceneId
          ? `scene:${event.sourceSceneId}`
          : undefined;
      const target = event.objectEntityId
        ? `entity:${event.objectEntityId}`
        : event.sourceSceneId
          ? `scene:${event.sourceSceneId}`
          : undefined;
      if (source && target && source !== target)
        edges.push({
          id: `event:${event.id}`,
          source,
          target,
          type: edgeType(event.eventType),
          label:
            event.predicate ??
            event.eventType.replaceAll("_", " ").toLowerCase(),
        });
      if (
        event.subjectEntityId &&
        event.sourceSceneId &&
        sceneIds.has(event.sourceSceneId)
      )
        edges.push({
          id: `appearance:${event.id}`,
          source: `entity:${event.subjectEntityId}`,
          target: `scene:${event.sourceSceneId}`,
          type: "appears-in",
          label: "appears in",
        });
    });
    diagnostics.forEach((diagnostic, index) => {
      const id = `diagnostic:${diagnostic.id}`;
      nodes.push({
        id,
        type: "diagnostic",
        label: diagnostic.title,
        detail: diagnostic.explanation,
        meta: diagnostic.severity,
        sourceSceneId:
          diagnostic.affectedSceneId ?? diagnostic.sourceSceneId ?? undefined,
        x: 100 + index * 230,
        y: 900,
        width: 210,
        height: 100,
      });
      const affected = diagnostic.affectedSceneId ?? diagnostic.sourceSceneId;
      if (affected)
        edges.push({
          id: `diagnostic-edge:${diagnostic.id}`,
          source: id,
          target: `scene:${affected}`,
          type: "conflicts-with",
          label: "requires review",
        });
    });
    const actualSequence = projections[0]?.atManuscriptSequence ?? 0;
    return Response.json(
      {
        branchId,
        sequence: actualSequence,
        nodes,
        edges,
        diagnostics: diagnostics.map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.explanation,
          severity: item.severity === "INFO" ? "information" : "warning",
          sceneId: item.affectedSceneId ?? item.sourceSceneId ?? undefined,
          resolved: false,
        })),
        bounds: {
          x: 0,
          y: 0,
          width: Math.max(900, chapters.length * 560 + 120),
          height: Math.max(1050, 800 + Math.ceil(entities.length / 4) * 110),
        },
        compilerVersion: projections[0]?.compilerVersion ?? "storyworld-v1",
        entityStates: projections.map((projection) => ({
          entityId: projection.entityId,
          state: projection.stateJson,
        })),
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    return storyworldError(error);
  }
}
