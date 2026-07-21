import { Prisma, type PrismaClient } from "@/generated/prisma";

type Transaction = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">;

const json = (value: unknown): Prisma.InputJsonValue => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

export async function createLegacyEntity(tx: Transaction, seriesId: string, entityType: string, name: string, sceneId: string, chronology: number) {
  if (entityType === "CHARACTER") {
    const existing = await tx.character.findFirst({ where: { seriesId, name, deletedAt: null } });
    return existing ?? tx.character.create({ data: { seriesId, name, role: "Character", canonStatus: "CANON" } });
  }
  if (entityType === "PLACE") {
    return tx.location.upsert({ where: { seriesId_name: { seriesId, name } }, create: { seriesId, name, canonStatus: "CANON" }, update: { deletedAt: null } });
  }
  if (entityType === "OBJECT") {
    return tx.storyObject.upsert({ where: { seriesId_name: { seriesId, name } }, create: { seriesId, name, kind: "Story object" }, update: { deletedAt: null } });
  }
  const existing = await tx.timelineEvent.findFirst({ where: { seriesId, title: name } });
  return existing ?? tx.timelineEvent.create({ data: { seriesId, sceneId, title: name, chronology } });
}

export async function applyProposalRun(tx: Transaction, input: {
  runId: string;
  seriesId: string;
  sceneId: string;
  userId: string;
  revision: number;
  manuscriptHash: string;
  expectedVersion: number;
  proposalIds: string[];
}) {
  const [run, universe, scene] = await Promise.all([
    tx.canonAnalysisRun.findFirst({ where: { id: input.runId, sceneId: input.sceneId }, include: { proposals: { where: { id: { in: input.proposalIds }, status: "PENDING" } } } }),
    tx.canonUniverse.findUnique({ where: { seriesId: input.seriesId } }),
    tx.scene.findUnique({ where: { id: input.sceneId }, include: { chapter: true } }),
  ]);
  if (!run || !universe || !scene) throw new Error("Proposal run is no longer available");
  if (run.revision !== input.revision || run.manuscriptHash !== input.manuscriptHash || scene.revision !== input.revision) throw new Error("STALE_REVISION");
  if (universe.version !== input.expectedVersion) throw new Error("CANON_VERSION_CONFLICT");
  if (run.proposals.length !== input.proposalIds.length) throw new Error("PROPOSAL_SET_CHANGED");

  const sequence = scene.chapter.number * 10000 + scene.position;
  const existingMoment = await tx.canonMoment.findFirst({ where: { universeId: universe.id, branchId: null, sequence } });
  const moment = existingMoment
    ? await tx.canonMoment.update({ where: { id: existingMoment.id }, data: { sceneId: scene.id, label: scene.title } })
    : await tx.canonMoment.create({ data: { universeId: universe.id, sceneId: scene.id, sequence, manuscriptOrder: scene.position, readerOrder: scene.position, label: scene.title } });
  const commit = await tx.canonCommit.create({ data: { universeId: universe.id, requestedById: input.userId, expectedVersion: universe.version, resultingVersion: universe.version + 1 } });
  const entities = new Map<string, { id: string; sourceId: string }>();

  for (const proposal of run.proposals) {
    const name = proposal.entityName ?? "Untitled event";
    let canonEntity = proposal.entityId ? await tx.canonEntity.findFirst({ where: { id: proposal.entityId, universeId: universe.id } }) : null;
    if (!canonEntity && proposal.entityType) {
      const cached = entities.get(`${proposal.entityType}:${name.toLowerCase()}`);
      if (cached) canonEntity = await tx.canonEntity.findUnique({ where: { id: cached.id } });
      else {
        const legacy = await createLegacyEntity(tx, input.seriesId, proposal.entityType, name, input.sceneId, moment.sequence);
        canonEntity = await tx.canonEntity.upsert({
          where: { universeId_sourceType_sourceId: { universeId: universe.id, sourceType: proposal.entityType, sourceId: legacy.id } },
          create: { universeId: universe.id, entityType: proposal.entityType, name, sourceType: proposal.entityType, sourceId: legacy.id },
          update: { name, deletedAt: null },
        });
        entities.set(`${proposal.entityType}:${name.toLowerCase()}`, { id: canonEntity.id, sourceId: legacy.id });
      }
    }
    if (!canonEntity) throw new Error("Proposal does not resolve to a story entity");
    const evidence = proposal.evidence as { blockId: string; quote: string; startOffset: number; endOffset: number };
    await tx.canonMention.create({ data: { sceneId: input.sceneId, entityId: canonEntity.id, momentId: moment.id, blockId: evidence.blockId, quote: evidence.quote, startOffset: evidence.startOffset, endOffset: evidence.endOffset, revision: input.revision } });
    let transitionId: string | undefined;
    if (proposal.kind === "TRANSITION" || proposal.kind === "EVENT" || proposal.kind === "WARNING") {
      const transition = await tx.canonTransition.create({ data: { entityId: canonEntity.id, momentId: moment.id, property: proposal.property ?? "exists", beforeValue: proposal.beforeValue === null ? Prisma.JsonNull : proposal.beforeValue === undefined ? undefined : json(proposal.beforeValue), afterValue: proposal.afterValue === null || proposal.afterValue === undefined ? Prisma.JsonNull : json(proposal.afterValue), evidence: json(evidence), confidence: proposal.confidence, status: proposal.kind === "WARNING" ? "UNRESOLVED" : "CONFIRMED" } });
      transitionId = transition.id;
      const affected = await tx.canonTransition.findMany({
        where: { entityId: canonEntity.id, property: proposal.property ?? "exists", id: { not: transition.id }, status: "CONFIRMED", moment: { sequence: { gte: moment.sequence } } },
        select: { id: true, evidence: true },
      });
      for (const target of affected) {
        await tx.canonDependency.upsert({
          where: { universeId_sourceRecordType_sourceRecordId_targetRecordType_targetRecordId: { universeId: universe.id, sourceRecordType: "CanonTransition", sourceRecordId: transition.id, targetRecordType: "CanonTransition", targetRecordId: target.id } },
          create: { universeId: universe.id, sourceRecordType: "CanonTransition", sourceRecordId: transition.id, targetRecordType: "CanonTransition", targetRecordId: target.id, consequenceClass: proposal.kind === "WARNING" ? "POTENTIAL_CONFLICT" : "FUTURE", severity: proposal.kind === "WARNING" ? "HIGH" : "MEDIUM", evidence: json({ source: evidence, target: target.evidence }) },
          update: { active: true, consequenceClass: proposal.kind === "WARNING" ? "POTENTIAL_CONFLICT" : "FUTURE", evidence: json({ source: evidence, target: target.evidence }) },
        });
      }
    }
    await tx.canonCommitItem.create({ data: { commitId: commit.id, proposalId: proposal.id, transitionId, recordType: transitionId ? "CanonTransition" : "CanonEntity", recordId: transitionId ?? canonEntity.id, beforeValue: proposal.beforeValue === null ? Prisma.JsonNull : proposal.beforeValue === undefined ? undefined : json(proposal.beforeValue), afterValue: proposal.afterValue === null ? Prisma.JsonNull : proposal.afterValue === undefined ? undefined : json(proposal.afterValue) } });
  }
  await tx.canonProposal.updateMany({ where: { runId: run.id, id: { in: input.proposalIds } }, data: { status: "CONFIRMED", resolvedAt: new Date() } });
  await tx.canonAnalysisRun.update({ where: { id: run.id }, data: { status: "CONFIRMED" } });
  await tx.canonUniverse.update({ where: { id: universe.id }, data: { version: { increment: 1 } } });
  return { commitId: commit.id, canonVersion: universe.version + 1 };
}
