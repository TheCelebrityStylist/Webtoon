import { prisma } from "../lib/prisma";
import { createSceneYDocument, encodeSceneSnapshot } from "../lib/storyworld/local-first/y-document";

async function migrateUniverse(universeId: string, seriesId: string) {
  const main = await prisma.canonBranch.upsert({
    where: { universeId_name: { universeId, name: "Main" } },
    create: { universeId, name: "Main", forkSequence: 0, forkManuscriptSequence: 0, active: true, status: "ACTIVE" },
    update: { active: true },
  });
  const scenes = await prisma.scene.findMany({
    where: { chapter: { seriesId }, deletedAt: null },
    orderBy: [{ chapter: { position: "asc" } }, { position: "asc" }],
  });
  for (const [index, scene] of scenes.entries()) {
    let document = await prisma.sceneCollaborativeDocument.findFirst({ where: { sceneId: scene.id, branchId: null } });
    if (!document) {
      const yDocument = createSceneYDocument(scene.id, { json: scene.manuscriptJson as never, text: scene.manuscriptText });
      const encoded = encodeSceneSnapshot(yDocument);
      document = await prisma.sceneCollaborativeDocument.create({
        data: { sceneId: scene.id, snapshot: Buffer.from(encoded.snapshot), stateVector: Buffer.from(encoded.stateVector) },
      });
    }
    await prisma.sceneDocumentCheckpoint.upsert({
      where: { documentId_sequence: { documentId: document.id, sequence: document.snapshotSequence } },
      create: {
        documentId: document.id,
        sequence: document.snapshotSequence,
        manuscriptJson: JSON.parse(JSON.stringify(scene.manuscriptJson)),
        manuscriptText: scene.manuscriptText,
        wordCount: scene.wordCount,
        source: "MIGRATION",
        createdById: "system:migration",
      },
      update: {},
    });
    const existing = await prisma.canonEvent.findFirst({ where: { branchId: main.id, sourceSceneId: scene.id, eventType: "ENTITY_INTRODUCED", commitId: "migration:baseline" } });
    if (!existing && scene.manuscriptText.trim()) {
      await prisma.canonEvent.create({
        data: {
          universeId,
          branchId: main.id,
          commitId: "migration:baseline",
          eventType: "ENTITY_INTRODUCED",
          valueJson: { migratedScene: true },
          perspective: "NARRATOR",
          manuscriptSequence: index,
          sourceSceneId: scene.id,
          evidence: [{ id: `migration:${scene.id}`, sceneId: scene.id, checkpointSequence: document.snapshotSequence, blockId: "migration-root", startOffset: 0, endOffset: 1, exactQuote: scene.manuscriptText.slice(0, 1), quoteHash: "manual-migration", sourceType: "MANUAL", sourceCommitId: "migration:baseline", stale: false }],
        },
      });
    }
  }
}

async function main() {
  const universes = await prisma.canonUniverse.findMany({ select: { id: true, seriesId: true } });
  for (const universe of universes) await migrateUniverse(universe.id, universe.seriesId);
}

main().finally(() => prisma.$disconnect());
