import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/server/authorization";
import { serializeWorkspace, workspaceInclude } from "@/lib/story-canvas/server-serializer";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth(); if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  try { await requireProjectAccess(session.user.id, projectId); const [project, connection, document] = await Promise.all([
    prisma.series.findUnique({ where: { id: projectId }, include: workspaceInclude }),
    prisma.integrationConnection.findUnique({ where: { userId_provider: { userId: session.user.id, provider: "google" } } }),
    prisma.googleDocumentReference.findFirst({ where: { userId: session.user.id, seriesId: projectId, kind: "PRIMARY_DOC" }, orderBy: { createdAt: "desc" } }),
  ]); if (!project) return Response.json({ error: "Project not found" }, { status: 404 });
    const connected = Boolean(connection && !connection.revokedAt); const sync = { status: document?.syncStatus === "CONFLICT" ? "conflict" as const : document ? "synced" as const : connected ? "connected" as const : "not-connected" as const, accountEmail: connection?.accountEmail ?? undefined, grantedServices: connection?.grantedScopes ?? [], documentId: document?.googleId, documentName: document?.title, documentUrl: document?.documentUrl ?? undefined, latestRevisionId: document?.revisionId ?? undefined, driveVersion: document?.driveVersion ?? undefined, modifiedTime: document?.modifiedTime?.toISOString(), lastSyncedAt: document?.lastSyncedAt?.toISOString(), lastSyncedCanonVersion: document?.canonVersion ?? undefined, lastSyncedManuscriptRevision: document?.manuscriptRevision ?? undefined };
    return Response.json(serializeWorkspace(project, sync), { headers: { "cache-control": "private, no-store" } });
  } catch { return Response.json({ error: "Forbidden" }, { status: 403 }); }
}
