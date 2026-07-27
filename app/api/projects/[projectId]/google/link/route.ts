import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { googleErrorResponse, googleJson } from "@/integrations/google/client";
import { requireProjectAccess } from "@/server/authorization";
import { buildGoogleDocumentPlan } from "@/lib/google/story-docs";
import { serializeWorkspace, workspaceInclude } from "@/lib/story-canvas/server-serializer";

const input = z.object({
  action: z.enum(["create", "inspect", "link", "replace"]),
  documentId: z.string().min(10).optional(),
  expectedRevision: z.string().min(1).optional(),
  confirmation: z.literal("REPLACE").optional(),
});
type Doc = {
  documentId: string;
  title: string;
  revisionId?: string;
  namedRanges?: Record<string, { namedRanges?: Array<{ namedRangeId?: string; ranges?: Array<{ startIndex?: number; endIndex?: number }> }> }>;
  body?: { content?: Array<{ startIndex?: number; endIndex?: number; paragraph?: { paragraphStyle?: { namedStyleType?: string }; elements?: Array<{ textRun?: { content?: string } }> } }> };
};

const summary = (doc: Doc) => {
  const paragraphs = (doc.body?.content ?? []).flatMap((item) => item.paragraph ? [item.paragraph] : []);
  const text = paragraphs.flatMap((paragraph) => paragraph.elements ?? []).map((element) => element.textRun?.content ?? "").join("");
  return {
    documentId: doc.documentId,
    title: doc.title,
    revisionId: doc.revisionId,
    empty: text.trim().length === 0,
    wordCount: text.trim() ? text.trim().split(/\s+/u).length : 0,
    headings: paragraphs.filter((paragraph) => paragraph.paragraphStyle?.namedStyleType?.startsWith("HEADING")).length,
    namedRangeCount: Object.keys(doc.namedRanges ?? {}).length,
  };
};

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  try {
    await requireProjectAccess(session.user.id, projectId, ["OWNER", "WRITER", "EDITOR"]);
    const parsed = input.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Choose how to link the document" }, { status: 400 });
    const project = await prisma.series.findUnique({ where: { id: projectId }, include: workspaceInclude });
    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

    let doc: Doc;
    if (parsed.data.action === "create") {
      doc = await googleJson<Doc>(session.user.id, "https://www.googleapis.com/auth/documents", "https://docs.googleapis.com/v1/documents", { method: "POST", body: JSON.stringify({ title: project.title }) });
    } else {
      if (!parsed.data.documentId) return Response.json({ error: "Choose a document" }, { status: 400 });
      doc = await googleJson<Doc>(session.user.id, "https://www.googleapis.com/auth/documents", `https://docs.googleapis.com/v1/documents/${encodeURIComponent(parsed.data.documentId)}`);
      if (parsed.data.action === "inspect") return Response.json({ inspection: summary(doc), choices: ["import", "link", "create", "cancel"] });
    }

    const canvas = serializeWorkspace(project);
    let verified = doc;
    if (parsed.data.action === "create" || parsed.data.action === "replace") {
      if (parsed.data.action === "replace") {
        if (parsed.data.confirmation !== "REPLACE") return Response.json({ error: "Type REPLACE to confirm replacement", code: "REPLACE_CONFIRMATION_REQUIRED" }, { status: 422 });
        if (!parsed.data.expectedRevision || parsed.data.expectedRevision !== doc.revisionId) return Response.json({ error: "Google changed after the replacement preview was opened", code: "STALE_GOOGLE_REVISION" }, { status: 409 });
      }
      const plan = buildGoogleDocumentPlan(canvas.project);
      const endIndex = doc.body?.content?.at(-1)?.endIndex ?? 1;
      const deleteRanges = Object.values(doc.namedRanges ?? {}).flatMap((group) => group.namedRanges ?? []).flatMap((range) => range.namedRangeId ? [{ deleteNamedRange: { namedRangeId: range.namedRangeId } }] : []);
      const replacementPrefix = parsed.data.action === "replace" && endIndex > 1 ? [...deleteRanges, { deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1 } } }] : [];
      await googleJson(session.user.id, "https://www.googleapis.com/auth/documents", `https://docs.googleapis.com/v1/documents/${encodeURIComponent(doc.documentId)}:batchUpdate`, {
        method: "POST",
        body: JSON.stringify({ requests: [...replacementPrefix, ...plan.requests], writeControl: doc.revisionId ? { requiredRevisionId: doc.revisionId } : undefined }),
      });
      verified = await googleJson<Doc>(session.user.id, "https://www.googleapis.com/auth/documents", `https://docs.googleapis.com/v1/documents/${encodeURIComponent(doc.documentId)}`);
    }

    // Linking an existing Doc is intentionally metadata-only. It never mutates the selected file.
    const reference = await prisma.googleDocumentReference.upsert({
      where: { userId_googleId: { userId: session.user.id, googleId: doc.documentId } },
      create: {
        userId: session.user.id, seriesId: projectId, googleId: doc.documentId, kind: "PRIMARY_DOC", title: doc.title,
        documentUrl: `https://docs.google.com/document/d/${doc.documentId}/edit`, revisionId: verified.revisionId,
        manuscriptRevision: parsed.data.action === "create" || parsed.data.action === "replace" ? Math.max(0, ...canvas.scenes.map((scene) => scene.revision)) : null,
        namedRanges: verified.namedRanges ?? {}, driveVersion: parsed.data.action === "replace" ? doc.revisionId : null, lastSyncedAt: parsed.data.action === "create" || parsed.data.action === "replace" ? new Date() : null,
        syncStatus: parsed.data.action === "create" || parsed.data.action === "replace" ? "SYNCED" : "LINKED",
      },
      update: {
        kind: "PRIMARY_DOC", seriesId: projectId, title: doc.title,
        documentUrl: `https://docs.google.com/document/d/${doc.documentId}/edit`, revisionId: verified.revisionId,
        namedRanges: verified.namedRanges ?? {}, lastCheckedAt: new Date(),
        ...(parsed.data.action === "create" || parsed.data.action === "replace" ? { manuscriptRevision: Math.max(0, ...canvas.scenes.map((scene) => scene.revision)), driveVersion: parsed.data.action === "replace" ? doc.revisionId : undefined, lastSyncedAt: new Date(), syncStatus: "SYNCED" } : { syncStatus: "LINKED" }),
      },
    });
    return Response.json({
      documentId: reference.googleId,
      documentName: reference.title,
      documentUrl: reference.documentUrl,
      status: parsed.data.action === "create" || parsed.data.action === "replace" ? "synced" : "connected",
      latestRevisionId: reference.revisionId,
      lastSyncedAt: reference.lastSyncedAt,
      inspection: summary(verified),
    });
  } catch (error) {
    return googleErrorResponse(error);
  }
}
