import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { googleErrorResponse, googleJson } from "@/integrations/google/client";
import { requireProjectAccess } from "@/server/authorization";
import { buildGoogleDocumentPlan } from "@/lib/google/story-docs";
import { serializeWorkspace, workspaceInclude } from "@/lib/story-canvas/server-serializer";

const input = z.object({
  action: z.enum(["create", "inspect", "link"]),
  documentId: z.string().min(10).optional(),
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
    if (parsed.data.action === "create") {
      const plan = buildGoogleDocumentPlan(canvas.project);
      await googleJson(session.user.id, "https://www.googleapis.com/auth/documents", `https://docs.googleapis.com/v1/documents/${encodeURIComponent(doc.documentId)}:batchUpdate`, {
        method: "POST",
        body: JSON.stringify({ requests: plan.requests, writeControl: doc.revisionId ? { requiredRevisionId: doc.revisionId } : undefined }),
      });
      verified = await googleJson<Doc>(session.user.id, "https://www.googleapis.com/auth/documents", `https://docs.googleapis.com/v1/documents/${encodeURIComponent(doc.documentId)}`);
    }

    // Linking an existing Doc is intentionally metadata-only. It never mutates the selected file.
    const reference = await prisma.googleDocumentReference.upsert({
      where: { userId_googleId: { userId: session.user.id, googleId: doc.documentId } },
      create: {
        userId: session.user.id, seriesId: projectId, googleId: doc.documentId, kind: "PRIMARY_DOC", title: doc.title,
        documentUrl: `https://docs.google.com/document/d/${doc.documentId}/edit`, revisionId: verified.revisionId,
        manuscriptRevision: parsed.data.action === "create" ? Math.max(0, ...canvas.scenes.map((scene) => scene.revision)) : null,
        namedRanges: verified.namedRanges ?? {}, lastSyncedAt: parsed.data.action === "create" ? new Date() : null,
        syncStatus: parsed.data.action === "create" ? "SYNCED" : "LINKED",
      },
      update: {
        kind: "PRIMARY_DOC", seriesId: projectId, title: doc.title,
        documentUrl: `https://docs.google.com/document/d/${doc.documentId}/edit`, revisionId: verified.revisionId,
        namedRanges: verified.namedRanges ?? {}, lastCheckedAt: new Date(),
        ...(parsed.data.action === "create" ? { manuscriptRevision: Math.max(0, ...canvas.scenes.map((scene) => scene.revision)), lastSyncedAt: new Date(), syncStatus: "SYNCED" } : { syncStatus: "LINKED" }),
      },
    });
    return Response.json({
      documentId: reference.googleId,
      documentName: reference.title,
      documentUrl: reference.documentUrl,
      status: parsed.data.action === "create" ? "synced" : "connected",
      latestRevisionId: reference.revisionId,
      lastSyncedAt: reference.lastSyncedAt,
      inspection: summary(verified),
    });
  } catch (error) {
    return googleErrorResponse(error);
  }
}
