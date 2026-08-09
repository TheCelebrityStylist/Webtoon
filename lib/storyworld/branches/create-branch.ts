import * as Y from "yjs";
import { prisma } from "@/lib/prisma";
import { createSceneYDocument, encodeSceneSnapshot, restoreSceneDocument } from "../local-first/y-document";

export async function createStoryworldBranch(input: {
  projectId: string;
  userId: string;
  name: string;
  parentBranchId?: string;
  forkCommitId?: string;
  forkManuscriptSequence: number;
  sceneId: string;
  checkpointId: string;
  initiatingEvidence: unknown;
}) {
  return prisma.$transaction(async (tx) => {
    const universe = await tx.canonUniverse.findUnique({ where: { seriesId: input.projectId } });
    if (!universe) throw Object.assign(new Error("Storyworld not found"), { code: "STORYWORLD_NOT_FOUND" });
    const checkpoint = await tx.sceneDocumentCheckpoint.findFirst({
      where: { id: input.checkpointId, document: { sceneId: input.sceneId } },
      include: { document: true },
    });
    if (!checkpoint) throw Object.assign(new Error("Checkpoint not found"), { code: "CHECKPOINT_NOT_FOUND" });
    const parent = input.parentBranchId
      ? await tx.canonBranch.findFirst({ where: { id: input.parentBranchId, universeId: universe.id } })
      : await tx.canonBranch.findFirst({ where: { universeId: universe.id, parentId: null, status: "ACTIVE" }, orderBy: { createdAt: "asc" } });
    if (!parent) throw Object.assign(new Error("Main branch not found"), { code: "BRANCH_NOT_FOUND" });
    const forkCommitId = input.forkCommitId ?? (await tx.canonCommit.findFirst({ where: { universeId: universe.id }, orderBy: { createdAt: "desc" }, select: { id: true } }))?.id ?? "migration:baseline";
    const branch = await tx.canonBranch.create({
      data: {
        universeId: universe.id,
        name: input.name,
        parentId: parent.id,
        forkCommitId,
        forkSequence: input.forkManuscriptSequence,
        forkManuscriptSequence: input.forkManuscriptSequence,
        initiatingEvidence: input.initiatingEvidence as never,
        createdById: input.userId,
      },
    });
    const base = restoreSceneDocument(input.sceneId, new Uint8Array(checkpoint.document.snapshot));
    const copy = createSceneYDocument(input.sceneId);
    Y.applyUpdate(copy, Y.encodeStateAsUpdate(base), "branch-fork");
    const encoded = encodeSceneSnapshot(copy);
    const branchDocument = await tx.sceneCollaborativeDocument.create({
      data: {
        sceneId: input.sceneId,
        branchId: branch.id,
        snapshot: Buffer.from(encoded.snapshot),
        stateVector: Buffer.from(encoded.stateVector),
        snapshotSequence: checkpoint.sequence,
      },
    });
    await tx.branchSceneOverride.create({
      data: {
        branchId: branch.id,
        sceneId: input.sceneId,
        baseCheckpointId: checkpoint.id,
        branchDocumentId: branchDocument.id,
      },
    });
    return branch;
  });
}
