import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeWorkspace, workspaceInclude } from "@/lib/story-canvas/server-serializer";
import { requireUser } from "@/server/session";
import { StoryCanvas } from "./StoryCanvas";
import { StoryCanvasProvider } from "./hooks/useStoryCanvas";

export async function ProductionStoryCanvas({ projectId, sceneId }: { projectId: string; sceneId?: string }) {
  const user = await requireUser();
  const [project, connection, document] = await Promise.all([
    prisma.series.findUnique({ where: { id: projectId }, include: workspaceInclude }),
    prisma.integrationConnection.findFirst({ where: { userId: user.id, provider: "google", revokedAt: null } }),
    prisma.googleDocumentReference.findFirst({ where: { userId: user.id, seriesId: projectId, kind: "PRIMARY_DOC" }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!project) notFound();
  const sync = {
    status: document?.syncStatus === "CONFLICT" ? "conflict" as const : document ? "synced" as const : connection ? "connected" as const : "not-connected" as const,
    accountEmail: connection?.accountEmail ?? undefined,
    grantedServices: connection?.grantedScopes ?? [],
    documentId: document?.googleId,
    documentName: document?.title,
    documentUrl: document?.documentUrl ?? undefined,
    latestRevisionId: document?.revisionId ?? undefined,
    lastSyncedAt: document?.lastSyncedAt?.toISOString(),
  };
  const initial = serializeWorkspace(project, sync);
  if (sceneId && initial.scenes.some((scene) => scene.id === sceneId)) initial.currentSceneId = sceneId;
  return <StoryCanvasProvider projectId={projectId} mode="production" initialState={initial}><Suspense fallback={<div className="canvas-loading">Opening your manuscript…</div>}><StoryCanvas /></Suspense></StoryCanvasProvider>;
}
