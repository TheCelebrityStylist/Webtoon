import * as Y from "yjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";
import {
  encodeSceneSnapshot,
  MANUSCRIPT_META,
  readManuscriptMetadata,
  restoreSceneDocument,
} from "@/lib/storyworld/local-first/y-document";

const manuscriptSchema = z.object({
  branchId: z.string().min(1),
  sceneId: z.string().min(1),
  manuscriptJson: z.object({ type: z.string() }).passthrough(),
  manuscriptText: z.string(),
  inherited: z.boolean().optional(),
  updatedAt: z.string().optional(),
});

const bytes = (value: Uint8Array | Buffer) => new Uint8Array(value);

async function record(projectId: string, branchId: string, sceneId: string) {
  return prisma.branchSceneOverride.findFirst({
    where: {
      branchId,
      sceneId,
      scene: { chapter: { seriesId: projectId } },
    },
    include: { branchDocument: true, baseCheckpoint: true },
  });
}

function body(
  branchId: string,
  sceneId: string,
  document: Y.Doc,
  inherited: boolean,
  updatedAt: Date,
) {
  const manuscript = readManuscriptMetadata(document);
  if (!manuscript.json)
    throw Object.assign(new Error("Manuscript snapshot is missing"), {
      code: "MISSING_MANUSCRIPT",
      status: 422,
    });
  return {
    branchId,
    sceneId,
    manuscriptJson: manuscript.json,
    manuscriptText: manuscript.text,
    inherited,
    updatedAt: updatedAt.toISOString(),
  };
}

export async function GET(
  _: Request,
  {
    params,
  }: {
    params: Promise<{ projectId: string; branchId: string; sceneId: string }>;
  },
) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to continue" } },
      { status: 401 },
    );
  const { projectId, branchId, sceneId } = await params;
  try {
    await requireStoryworldBranch(session.user.id, projectId, branchId);
    const override = await record(projectId, branchId, sceneId);
    if (!override)
      return Response.json(
        {
          error: {
            code: "BRANCH_SCENE_NOT_FOUND",
            message: "This scene is not part of the selected branch",
          },
        },
        { status: 404 },
      );
    const document = restoreSceneDocument(
      sceneId,
      bytes(override.branchDocument.snapshot),
    );
    return Response.json(
      body(
        branchId,
        sceneId,
        document,
        override.branchDocument.snapshotSequence ===
          override.baseCheckpoint.sequence,
        override.branchDocument.updatedAt,
      ),
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    return storyworldError(error);
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ projectId: string; branchId: string; sceneId: string }>;
  },
) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to continue" } },
      { status: 401 },
    );
  const { projectId, branchId, sceneId } = await params;
  const parsed = manuscriptSchema.safeParse(await request.json());
  if (
    !parsed.success ||
    parsed.data.branchId !== branchId ||
    parsed.data.sceneId !== sceneId
  )
    return Response.json(
      {
        error: {
          code: "INVALID_BRANCH_SCENE",
          message: "Branch manuscript is invalid",
        },
      },
      { status: 400 },
    );
  try {
    await requireStoryworldBranch(session.user.id, projectId, branchId, [
      "OWNER",
      "WRITER",
      "EDITOR",
    ]);
    const override = await record(projectId, branchId, sceneId);
    if (!override)
      return Response.json(
        {
          error: {
            code: "BRANCH_SCENE_NOT_FOUND",
            message: "This scene is not part of the selected branch",
          },
        },
        { status: 404 },
      );
    const document = restoreSceneDocument(
      sceneId,
      bytes(override.branchDocument.snapshot),
    );
    document.transact(() => {
      const metadata = document.getMap<unknown>(MANUSCRIPT_META);
      metadata.set("manuscriptJson", parsed.data.manuscriptJson);
      metadata.set("manuscriptText", parsed.data.manuscriptText);
    }, "branch-manuscript-api");
    const encoded = encodeSceneSnapshot(document);
    const updated = await prisma.sceneCollaborativeDocument.update({
      where: { id: override.branchDocument.id },
      data: {
        snapshot: Buffer.from(encoded.snapshot),
        stateVector: Buffer.from(encoded.stateVector),
        snapshotSequence: { increment: 1 },
      },
    });
    return Response.json(
      body(branchId, sceneId, document, false, updated.updatedAt),
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    return storyworldError(error);
  }
}
