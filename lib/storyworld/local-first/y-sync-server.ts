import * as Y from "yjs";
import { prisma } from "@/lib/prisma";
import { createSceneYDocument, encodeSceneSnapshot, readManuscriptMetadata, restoreSceneDocument } from "./y-document";

const bytes = (value: Uint8Array) => Buffer.from(value);
const array = (value: Uint8Array | Buffer) => new Uint8Array(value);

async function ensureDocument(sceneId: string, branchId?: string) {
  const existing = await prisma.sceneCollaborativeDocument.findFirst({ where: { sceneId, branchId: branchId ?? null } });
  if (existing) return existing;
  const scene = await prisma.scene.findUniqueOrThrow({ where: { id: sceneId }, select: { manuscriptJson: true, manuscriptText: true } });
  const document = createSceneYDocument(sceneId, { json: scene.manuscriptJson as never, text: scene.manuscriptText });
  const encoded = encodeSceneSnapshot(document);
  return prisma.sceneCollaborativeDocument.create({
    data: { sceneId, branchId, snapshot: bytes(encoded.snapshot), stateVector: bytes(encoded.stateVector) },
  });
}

export async function synchronizeSceneDocument(input: {
  sceneId: string;
  branchId?: string;
  userId: string;
  clientStateVector: Uint8Array;
  updates: Array<{ mutationId: string; bytes: Uint8Array }>;
}) {
  const record = await ensureDocument(input.sceneId, input.branchId);
  return prisma.$transaction(async (tx) => {
    const current = await tx.sceneCollaborativeDocument.findUniqueOrThrow({ where: { id: record.id } });
    const document = restoreSceneDocument(input.sceneId, array(current.snapshot));
    const existing = new Set((await tx.sceneCollaborativeUpdate.findMany({
      where: { documentId: current.id, mutationId: { in: input.updates.map((update) => update.mutationId) } },
      select: { mutationId: true },
    })).map((update) => update.mutationId));
    let sequence = current.snapshotSequence;
    const accepted: string[] = [];
    for (const update of input.updates) {
      if (existing.has(update.mutationId)) {
        accepted.push(update.mutationId);
        continue;
      }
      Y.applyUpdate(document, update.bytes, "client-sync");
      sequence += 1;
      await tx.sceneCollaborativeUpdate.create({
        data: { documentId: current.id, sequence, updateBytes: bytes(update.bytes), mutationId: update.mutationId, createdById: input.userId },
      });
      accepted.push(update.mutationId);
    }
    const encoded = encodeSceneSnapshot(document);
    await tx.sceneCollaborativeDocument.update({
      where: { id: current.id },
      data: { snapshot: bytes(encoded.snapshot), stateVector: bytes(encoded.stateVector), snapshotSequence: sequence },
    });
    return {
      snapshotSequence: sequence,
      stateVector: encoded.stateVector,
      update: Y.encodeStateAsUpdate(document, input.clientStateVector),
      acceptedMutationIds: accepted,
    };
  });
}

export async function checkpointSceneDocument(input: { sceneId: string; branchId?: string; sequence: number; userId: string; source: string }) {
  const record = await ensureDocument(input.sceneId, input.branchId);
  if (record.snapshotSequence !== input.sequence) throw Object.assign(new Error("Scene changed before checkpoint"), { code: "STALE_SCENE", currentSequence: record.snapshotSequence });
  const document = restoreSceneDocument(input.sceneId, array(record.snapshot));
  const manuscript = readManuscriptMetadata(document);
  if (!manuscript.json) throw Object.assign(new Error("Collaborative document has no manuscript snapshot"), { code: "MISSING_MANUSCRIPT" });
  return prisma.sceneDocumentCheckpoint.upsert({
    where: { documentId_sequence: { documentId: record.id, sequence: input.sequence } },
    create: {
      documentId: record.id,
      sequence: input.sequence,
      manuscriptJson: manuscript.json as never,
      manuscriptText: manuscript.text,
      wordCount: manuscript.text.trim().split(/\s+/).filter(Boolean).length,
      source: input.source,
      createdById: input.userId,
    },
    update: {},
  });
}
