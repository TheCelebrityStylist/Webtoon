import * as Y from "yjs";
import { prisma } from "@/lib/prisma";
import { encodeSceneSnapshot, restoreSceneDocument } from "../local-first/y-document";

export type MergeSelection = { eventIds: string[]; sceneIds: string[] };

export async function mergeStoryworldBranch(input: {
  projectId: string;
  userId: string;
  sourceBranchId: string;
  expectedUniverseVersion: number;
  selection: MergeSelection;
}) {
  const source = await prisma.canonBranch.findFirst({ where: { id: input.sourceBranchId, universe: { seriesId: input.projectId } } });
  if (!source?.parentId || !source.forkCommitId) throw Object.assign(new Error("Branch has no merge base"), { code: "MERGE_BASE_MISSING", status: 422 });
  const target = await prisma.canonBranch.findUnique({ where: { id: source.parentId } });
  if (!target) throw Object.assign(new Error("Target branch not found"), { code: "BRANCH_NOT_FOUND", status: 404 });
  return prisma.$transaction(async (tx) => {
    const universe = await tx.canonUniverse.findUniqueOrThrow({ where: { id: source.universeId }, select: { version: true } });
    if (universe.version !== input.expectedUniverseVersion) throw Object.assign(new Error("Storyworld changed"), { code: "STALE_STORYWORLD", status: 409 });
    const inverseScenes: Array<{ documentId: string; snapshot: string; stateVector: string; snapshotSequence: number }> = [];
    for (const sceneId of input.selection.sceneIds) {
      const override = await tx.branchSceneOverride.findFirst({ where: { branchId: source.id, sceneId }, include: { branchDocument: true, baseCheckpoint: true } });
      if (!override) throw Object.assign(new Error("Branch scene override not found"), { code: "OVERRIDE_NOT_FOUND", status: 422 });
      const targetDocument = await tx.sceneCollaborativeDocument.findFirst({ where: { sceneId, branchId: target.parentId ? target.id : null } });
      if (!targetDocument) throw Object.assign(new Error("Target scene document not found"), { code: "TARGET_DOCUMENT_NOT_FOUND", status: 422 });
      if (targetDocument.snapshotSequence !== override.baseCheckpoint.sequence) throw Object.assign(new Error("Both histories edited this scene"), { code: "SEMANTIC_MERGE_CONFLICT", status: 409 });
      inverseScenes.push({ documentId: targetDocument.id, snapshot: Buffer.from(targetDocument.snapshot).toString("base64"), stateVector: Buffer.from(targetDocument.stateVector).toString("base64"), snapshotSequence: targetDocument.snapshotSequence });
      const targetYDoc = restoreSceneDocument(sceneId, new Uint8Array(targetDocument.snapshot));
      const branchYDoc = restoreSceneDocument(sceneId, new Uint8Array(override.branchDocument.snapshot));
      Y.applyUpdate(targetYDoc, Y.encodeStateAsUpdate(branchYDoc), "branch-merge");
      const encoded = encodeSceneSnapshot(targetYDoc);
      await tx.sceneCollaborativeDocument.update({ where: { id: targetDocument.id }, data: { snapshot: Buffer.from(encoded.snapshot), stateVector: Buffer.from(encoded.stateVector), snapshotSequence: targetDocument.snapshotSequence + 1 } });
    }
    const selectedEvents = await tx.canonEvent.findMany({ where: { id: { in: input.selection.eventIds }, branchId: source.id } });
    if (selectedEvents.length !== input.selection.eventIds.length) throw Object.assign(new Error("Selected event is outside the source branch"), { code: "EVENT_OUTSIDE_BRANCH", status: 422 });
    if (!source.forkCommitId) throw Object.assign(new Error("Branch has no merge base"), { code: "MERGE_BASE_MISSING", status: 422 });
    const commit = await tx.canonCommit.create({ data: { universeId: source.universeId, requestedById: input.userId, expectedVersion: universe.version, resultingVersion: universe.version + 1 } });
    for (const event of selectedEvents) await tx.canonEvent.create({ data: { universeId: event.universeId, branchId: target.id, commitId: commit.id, eventType: event.eventType, subjectEntityId: event.subjectEntityId, objectEntityId: event.objectEntityId, predicate: event.predicate, valueJson: event.valueJson ?? undefined, perspective: event.perspective, perspectiveEntityId: event.perspectiveEntityId, manuscriptSequence: event.manuscriptSequence, storySequence: event.storySequence, storyDateStart: event.storyDateStart, storyDateEnd: event.storyDateEnd, sourceSceneId: event.sourceSceneId, evidenceId: event.evidenceId, evidence: event.evidence ?? undefined, status: event.status } });
    const merge = await tx.branchMerge.create({ data: { sourceBranchId: source.id, targetBranchId: target.id, baseCommitId: source.forkCommitId, mergeCommitId: commit.id, selectedChanges: input.selection, inverseChanges: { scenes: inverseScenes, eventCommitId: commit.id }, status: "APPLIED", createdById: input.userId, completedAt: new Date() } });
    await tx.canonUniverse.update({ where: { id: source.universeId }, data: { version: { increment: 1 } } });
    await tx.canonBranch.update({ where: { id: source.id }, data: { status: "MERGED", mergedAt: new Date() } });
    return { mergeId: merge.id, mergeCommitId: commit.id, resultingVersion: universe.version + 1 };
  });
}

export async function revertStoryworldMerge(input: { projectId: string; userId: string; commitId: string; expectedUniverseVersion: number }) {
  return prisma.$transaction(async (tx) => {
    const merge = await tx.branchMerge.findFirst({ where: { mergeCommitId: input.commitId, targetBranch: { universe: { seriesId: input.projectId } }, status: "APPLIED" }, include: { targetBranch: true } });
    if (!merge) throw Object.assign(new Error("Merge not found"), { code: "MERGE_NOT_FOUND", status: 404 });
    const universe = await tx.canonUniverse.findUniqueOrThrow({ where: { id: merge.targetBranch.universeId }, select: { version: true } });
    if (universe.version !== input.expectedUniverseVersion) throw Object.assign(new Error("Storyworld changed"), { code: "STALE_STORYWORLD", status: 409 });
    const inverse = merge.inverseChanges as { scenes?: Array<{ documentId: string; snapshot: string; stateVector: string; snapshotSequence: number }>; eventCommitId?: string };
    for (const scene of inverse.scenes ?? []) await tx.sceneCollaborativeDocument.update({ where: { id: scene.documentId }, data: { snapshot: Buffer.from(scene.snapshot, "base64"), stateVector: Buffer.from(scene.stateVector, "base64"), snapshotSequence: scene.snapshotSequence } });
    if (inverse.eventCommitId) await tx.canonEvent.deleteMany({ where: { commitId: inverse.eventCommitId, branchId: merge.targetBranchId } });
    await tx.branchMerge.update({ where: { id: merge.id }, data: { status: "REVERTED" } });
    await tx.canonCommit.update({ where: { id: input.commitId }, data: { revertedAt: new Date(), revertedById: input.userId } });
    await tx.canonUniverse.update({ where: { id: merge.targetBranch.universeId }, data: { version: { increment: 1 } } });
    return { mergeId: merge.id, reverted: true, resultingVersion: universe.version + 1 };
  });
}
