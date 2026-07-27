import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { googleErrorResponse, googleJson } from "@/integrations/google/client";
import { buildMorrowToGoogleSyncPlan, compareGoogleDocument, parseGoogleScenesByNamedRange } from "@/lib/google/story-docs";
import { serializeWorkspace, workspaceInclude } from "@/lib/story-canvas/server-serializer";
import { requireProjectAccess } from "@/server/authorization";

type Doc = Parameters<typeof parseGoogleScenesByNamedRange>[0] & { documentId: string; title: string; revisionId: string; namedRanges?: Record<string, never> };

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  try {
    await requireProjectAccess(session.user.id, projectId, ["OWNER", "WRITER", "EDITOR"]);
    const [project, reference] = await Promise.all([
      prisma.series.findUnique({ where: { id: projectId }, include: workspaceInclude }),
      prisma.googleDocumentReference.findFirst({ where: { userId: session.user.id, seriesId: projectId, kind: "PRIMARY_DOC" }, orderBy: { createdAt: "desc" } }),
    ]);
    if (!project || !reference) return Response.json({ error: "Link a Google Doc before synchronizing" }, { status: 400 });
    const url = `https://docs.googleapis.com/v1/documents/${encodeURIComponent(reference.googleId)}`;
    const doc = await googleJson<Doc>(session.user.id, "https://www.googleapis.com/auth/documents", url);
    const canvas = serializeWorkspace(project);
    const localRevision = Math.max(0, ...canvas.scenes.map((scene) => scene.revision));
    const googleScenes = parseGoogleScenesByNamedRange(doc);
    const externalHeadings = (doc.body?.content ?? []).flatMap((item) => item.paragraph?.paragraphStyle?.namedStyleType?.startsWith("HEADING") ? [(item.paragraph.elements ?? []).map((element) => element.textRun?.content ?? "").join("").trim()] : []).filter(Boolean);
    const comparison = compareGoogleDocument({
      documentId: reference.googleId,
      storedRevision: reference.revisionId ?? undefined,
      googleRevision: doc.revisionId,
      storedLocalRevision: reference.manuscriptRevision ?? undefined,
      localRevision,
      localScenes: canvas.scenes.map((scene) => ({ id: scene.id, title: scene.title, content: scene.manuscriptText })),
      googleScenes,
      externalHeadings,
    });
    await prisma.googleDocumentReference.update({
      where: { id: reference.id },
      data: { lastCheckedAt: new Date(), syncStatus: comparison.status === "conflict" ? "CONFLICT" : comparison.status === "google-only" ? "GOOGLE_CHANGED" : reference.syncStatus },
    });
    if (comparison.status === "conflict" || comparison.status === "google-only") {
      return Response.json({ sync: { status: comparison.status === "conflict" ? "conflict" : "google-changed", externalChange: comparison, documentId: reference.googleId, documentName: reference.title, documentUrl: reference.documentUrl } });
    }
    const changed = canvas.scenes.filter((scene) => scene.revision > (reference.manuscriptRevision ?? -1)).map((scene) => scene.id);
    if (changed.length) {
      const plan = buildMorrowToGoogleSyncPlan(canvas.project, changed, doc.revisionId);
      await googleJson(session.user.id, "https://www.googleapis.com/auth/documents", `${url}:batchUpdate`, { method: "POST", body: JSON.stringify(plan) });
    }
    // Google batchUpdate does not return the canonical post-write document state.
    const verified = changed.length ? await googleJson<Doc>(session.user.id, "https://www.googleapis.com/auth/documents", url) : doc;
    const updated = await prisma.googleDocumentReference.update({
      where: { id: reference.id },
      data: { revisionId: verified.revisionId, namedRanges: verified.namedRanges ?? {}, manuscriptRevision: localRevision, lastSyncedAt: new Date(), syncStatus: "SYNCED" },
    });
    return Response.json({ sync: { status: "synced", documentId: updated.googleId, documentName: updated.title, documentUrl: updated.documentUrl, latestRevisionId: updated.revisionId, lastSyncedAt: updated.lastSyncedAt?.toISOString(), lastSyncedManuscriptRevision: updated.manuscriptRevision } });
  } catch (error) {
    return googleErrorResponse(error);
  }
}
