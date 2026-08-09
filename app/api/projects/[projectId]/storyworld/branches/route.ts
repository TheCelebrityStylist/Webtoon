import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldAccess, storyworldError } from "@/lib/storyworld/api";
import { createStoryworldBranch } from "@/lib/storyworld/branches/create-branch";
import { checkpointSceneDocument } from "@/lib/storyworld/local-first/y-sync-server";

const evidenceSchema = z.object({
  sceneId: z.string(),
  blockId: z.string(),
  startOffset: z.number().int().nonnegative(),
  endOffset: z.number().int().positive(),
  exactQuote: z.string().min(1),
  quoteHash: z.string().min(16),
});

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(500).optional(),
  parentBranchId: z.string().min(1).optional(),
  forkCommitId: z.string().min(1).optional(),
  forkManuscriptSequence: z.number().int().nonnegative().default(0),
  sceneId: z.string().min(1),
  checkpointId: z.string().min(1).optional(),
  initiatingEvidence: evidenceSchema.optional(),
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to continue" } },
      { status: 401 },
    );
  const { projectId } = await params;
  try {
    const universe = await requireStoryworldAccess(session.user.id, projectId);
    const branches = await prisma.canonBranch.findMany({
      where: { universeId: universe.id },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            sceneOverrides: true,
            diagnostics: { where: { status: "OPEN" } },
          },
        },
      },
    });
    const version = await prisma.canonUniverse.findUniqueOrThrow({
      where: { id: universe.id },
      select: { version: true },
    });
    return Response.json(
      { branches, universeVersion: version.version },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    return storyworldError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to continue" } },
      { status: 401 },
    );
  const { projectId } = await params;
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      {
        error: {
          code: "INVALID_BRANCH",
          message: "Branch details are invalid",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  try {
    await requireStoryworldAccess(session.user.id, projectId, [
      "OWNER",
      "WRITER",
      "EDITOR",
    ]);
    let checkpointId = parsed.data.checkpointId;
    if (!checkpointId) {
      const document = await prisma.sceneCollaborativeDocument.findFirst({
        where: { sceneId: parsed.data.sceneId, branchId: null },
        select: { snapshotSequence: true },
      });
      const checkpoint = await checkpointSceneDocument({
        sceneId: parsed.data.sceneId,
        sequence: document?.snapshotSequence ?? 0,
        source: "BRANCH_FORK",
        userId: session.user.id,
      });
      checkpointId = checkpoint.id;
    }
    const branch = await createStoryworldBranch({
      projectId,
      userId: session.user.id,
      ...parsed.data,
      checkpointId,
      initiatingEvidence: parsed.data.initiatingEvidence ?? {
        sourceType: "MANUAL",
        sceneId: parsed.data.sceneId,
      },
    });
    return Response.json({ branch }, { status: 201 });
  } catch (error) {
    return storyworldError(error);
  }
}
