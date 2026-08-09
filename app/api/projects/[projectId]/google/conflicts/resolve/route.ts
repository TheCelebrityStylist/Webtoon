import { Prisma } from "@/generated/prisma";
import { z } from "zod";
import { auth } from "@/auth";
import { googleJson } from "@/integrations/google/client";
import { prisma } from "@/lib/prisma";
import { assertGoogleConflictRevision, buildConflictGoogleRequests, parseGoogleScenesByNamedRange } from "@/lib/google/story-docs";
import { manuscriptFromText } from "@/lib/story-canvas/manuscript";
import { requireProjectAccess } from "@/server/authorization";
import { apiErrorResponse } from "@/server/api-errors";

const input = z.object({
  expectedGoogleRevision: z.string().min(1),
  decisions: z.array(z.object({
    sceneId: z.string().min(1),
    action: z.enum(["KEEP_MORROW", "USE_GOOGLE", "MERGE", "SKIP"]),
    mergedText: z.string().max(2_000_000).optional(),
  })).min(1),
});
type GoogleDoc = Parameters<typeof parseGoogleScenesByNamedRange>[0] & {
  revisionId: string;
  namedRanges?: Record<string, never>;
};

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in to resolve this conflict", code: "UNAUTHENTICATED" }, { status: 401 });
  const { projectId } = await params;
  const parsed = input.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Choose a resolution for at least one scene", code: "INVALID_RESOLUTION", details: parsed.error.flatten() }, { status: 400 });
  try {
    await requireProjectAccess(session.user.id, projectId, ["OWNER", "WRITER", "EDITOR"]);
    const reference = await prisma.googleDocumentReference.findFirst({ where: { userId: session.user.id, seriesId: projectId, kind: "PRIMARY_DOC" } });
    if (!reference) return Response.json({ error: "Linked Google document not found", code: "DOCUMENT_NOT_FOUND" }, { status: 404 });
    const scenes = await prisma.scene.findMany({ where: { id: { in: parsed.data.decisions.map((item) => item.sceneId) }, chapter: { seriesId: projectId }, deletedAt: null } });
    if (scenes.length !== new Set(parsed.data.decisions.map((item) => item.sceneId)).size) {
      return Response.json({ error: "One or more scenes are outside this project", code: "CROSS_PROJECT_SCENE" }, { status: 422 });
    }
    const url = `https://docs.googleapis.com/v1/documents/${encodeURIComponent(reference.googleId)}`;
    const google = await googleJson<GoogleDoc>(session.user.id, "https://www.googleapis.com/auth/documents", url);
    assertGoogleConflictRevision(parsed.data.expectedGoogleRevision, google.revisionId);
    const googleScenes = new Map(parseGoogleScenesByNamedRange(google).map((scene) => [scene.id, scene]));
    const requests = buildConflictGoogleRequests(parsed.data.decisions, scenes.map((scene) => ({ id: scene.id, title: scene.title, manuscriptText: scene.manuscriptText })));

    await prisma.$transaction(async (tx) => {
      for (const decision of parsed.data.decisions) {
        if (decision.action !== "USE_GOOGLE" && decision.action !== "MERGE") continue;
        const scene = scenes.find((item) => item.id === decision.sceneId)!;
        const replacement = decision.action === "MERGE" ? decision.mergedText : googleScenes.get(scene.id)?.content;
        if (replacement === undefined) throw Object.assign(new Error(`Google range missing for ${scene.title}`), { code: "UNMAPPED_SCENE" });
        await tx.manuscriptVersion.upsert({
          where: { sceneId_revision: { sceneId: scene.id, revision: scene.revision } },
          create: { sceneId: scene.id, userId: session.user.id, revision: scene.revision, manuscriptJson: scene.manuscriptJson as Prisma.InputJsonValue, manuscriptText: scene.manuscriptText },
          update: {},
        });
        const nextRevision = scene.revision + 1;
        await tx.scene.update({
          where: { id: scene.id },
          data: { manuscriptText: replacement, manuscriptJson: manuscriptFromText(replacement, scene.id) as Prisma.InputJsonValue, revision: nextRevision, wordCount: replacement.trim() ? replacement.trim().split(/\s+/u).length : 0, lastEditedAt: new Date() },
        });
      }
    });

    if (requests.length) {
      await googleJson(session.user.id, "https://www.googleapis.com/auth/documents", `${url}:batchUpdate`, {
        method: "POST",
        body: JSON.stringify({ requests, writeControl: { requiredRevisionId: google.revisionId } }),
      });
    }
    const verified = requests.length ? await googleJson<GoogleDoc>(session.user.id, "https://www.googleapis.com/auth/documents", url) : google;
    await prisma.googleDocumentReference.update({
      where: { id: reference.id },
      data: { driveVersion: google.revisionId, revisionId: verified.revisionId, namedRanges: verified.namedRanges ?? {}, syncStatus: parsed.data.decisions.some((item) => item.action === "SKIP") ? "CONFLICT" : "SYNCED", lastSyncedAt: new Date(), lastCheckedAt: new Date() },
    });
    return Response.json({ status: parsed.data.decisions.some((item) => item.action === "SKIP") ? "conflict" : "synced", previousGoogleRevision: google.revisionId, revisionId: verified.revisionId, resolvedSceneIds: parsed.data.decisions.filter((item) => item.action !== "SKIP").map((item) => item.sceneId) });
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      const code = String((error as Error & { code: string }).code);
      if (code === "STALE_GOOGLE_REVISION") return Response.json({ error: error.message, code }, { status: 409 });
      if (code === "UNMAPPED_SCENE" || code === "MERGED_TEXT_REQUIRED") return Response.json({ error: error.message, code }, { status: 422 });
    }
    return apiErrorResponse(error);
  }
}
