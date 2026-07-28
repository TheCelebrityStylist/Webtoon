import { z } from "zod";
import { auth } from "@/auth";
import { requireSceneAccess } from "@/server/scene-access";
import { prisma } from "@/lib/prisma";
import { synchronizeSceneDocument } from "@/lib/storyworld/local-first/y-sync-server";

const base64 = z.string().min(1).max(16_000_000).regex(/^[A-Za-z0-9+/]*={0,2}$/);
const inputSchema = z.object({
  branchId: z.string().min(1).optional(),
  stateVector: base64,
  updates: z.array(z.object({ mutationId: z.string().uuid(), bytes: base64 })).max(100),
});
const decode = (value: string) => new Uint8Array(Buffer.from(value, "base64"));
const encode = (value: Uint8Array) => Buffer.from(value).toString("base64");

async function authorize(userId: string, projectId: string, sceneId: string, branchId?: string) {
  await requireSceneAccess(userId, projectId, sceneId, ["OWNER", "WRITER", "EDITOR"]);
  if (!branchId) return;
  const branch = await prisma.canonBranch.findFirst({ where: { id: branchId, universe: { seriesId: projectId } }, select: { id: true } });
  if (!branch) throw Object.assign(new Error("Branch not found"), { code: "BRANCH_NOT_FOUND" });
}

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string; sceneId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, sceneId } = await params;
  const branchId = new URL(request.url).searchParams.get("branchId") ?? undefined;
  try {
    await authorize(session.user.id, projectId, sceneId, branchId);
    const document = await prisma.sceneCollaborativeDocument.findFirst({ where: { sceneId, branchId: branchId ?? null } });
    if (!document) return Response.json({ snapshotSequence: 0, stateVector: "", snapshot: "" });
    return Response.json({
      snapshotSequence: document.snapshotSequence,
      stateVector: encode(new Uint8Array(document.stateVector)),
      snapshot: encode(new Uint8Array(document.snapshot)),
    }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "FORBIDDEN";
    return Response.json({ error: { code, message: code === "BRANCH_NOT_FOUND" ? "Branch not found" : "Access denied" } }, { status: code === "BRANCH_NOT_FOUND" ? 404 : 403 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; sceneId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, sceneId } = await params;
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: { code: "INVALID_SYNC", message: "The scene update is invalid", details: parsed.error.flatten() } }, { status: 400 });
  try {
    await authorize(session.user.id, projectId, sceneId, parsed.data.branchId);
    const result = await synchronizeSceneDocument({
      sceneId,
      branchId: parsed.data.branchId,
      userId: session.user.id,
      clientStateVector: parsed.data.stateVector ? decode(parsed.data.stateVector) : new Uint8Array(),
      updates: parsed.data.updates.map((update) => ({ mutationId: update.mutationId, bytes: decode(update.bytes) })),
    });
    return Response.json({ ...result, stateVector: encode(result.stateVector), update: encode(result.update) });
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "SYNC_FAILED";
    return Response.json({ error: { code, message: code === "BRANCH_NOT_FOUND" ? "Branch not found" : "Scene synchronization failed" } }, { status: code === "BRANCH_NOT_FOUND" ? 404 : 500 });
  }
}
