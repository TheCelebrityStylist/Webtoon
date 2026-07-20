import { prisma } from "@/lib/prisma";
import type { CanonValue, Transition } from "./engine";
import { previewConsequences, reconstructWorld } from "./engine";

const json = (value: CanonValue) => JSON.parse(JSON.stringify(value));

export async function ensureCanonUniverse(seriesId: string) {
  return prisma.canonUniverse.upsert({ where: { seriesId }, create: { seriesId }, update: {} });
}

export async function canonAt(seriesId: string, sequence: number, branchId?: string) {
  const universe = await ensureCanonUniverse(seriesId);
  const rows = await prisma.canonTransition.findMany({
    where: { entity: { universeId: universe.id }, moment: { sequence: { lte: sequence }, ...(branchId ? { branchId } : {}) } },
    include: { moment: { select: { sequence: true } } }, orderBy: [{ moment: { sequence: "asc" } }, { createdAt: "asc" }],
  });
  const transitions: Transition[] = rows.map(row => ({ id: row.id, entityId: row.entityId, sequence: row.moment.sequence, property: row.property, beforeValue: row.beforeValue as CanonValue, afterValue: row.afterValue as CanonValue, status: row.status as Transition["status"] }));
  return { universe, sequence, world: reconstructWorld(sequence, transitions) };
}

export async function proposeTransition(input: { seriesId: string; entityId: string; momentId: string; property: string; beforeValue?: CanonValue; afterValue: CanonValue; evidence: CanonValue; confidence: number }) {
  const universe = await ensureCanonUniverse(input.seriesId);
  const entity = await prisma.canonEntity.findFirst({ where: { id: input.entityId, universeId: universe.id, deletedAt: null } });
  const moment = await prisma.canonMoment.findFirst({ where: { id: input.momentId, universeId: universe.id } });
  if (!entity || !moment) throw new Error("Canon transition references records outside this universe");
  return prisma.canonTransition.create({ data: { entityId: entity.id, momentId: moment.id, property: input.property, beforeValue: input.beforeValue === undefined ? undefined : json(input.beforeValue), afterValue: json(input.afterValue), evidence: json(input.evidence), confidence: input.confidence, status: "PROPOSED" } });
}

export async function confirmTransitions(seriesId: string, transitionIds: string[], expectedVersion: number) {
  return prisma.$transaction(async tx => {
    const universe = await tx.canonUniverse.findUnique({ where: { seriesId } });
    if (!universe || universe.version !== expectedVersion) throw new Error("Canon changed; preview consequences again");
    const count = await tx.canonTransition.count({ where: { id: { in: transitionIds }, status: "PROPOSED", entity: { universeId: universe.id } } });
    if (count !== transitionIds.length) throw new Error("One or more proposals are no longer available");
    await tx.canonTransition.updateMany({ where: { id: { in: transitionIds } }, data: { status: "CONFIRMED" } });
    return tx.canonUniverse.update({ where: { id: universe.id }, data: { version: { increment: 1 } } });
  });
}

export async function consequencePreview(seriesId: string, transitionIds: string[]) {
  const universe = await ensureCanonUniverse(seriesId);
  const rows = await prisma.canonTransition.findMany({ where: { entity: { universeId: universe.id } }, include: { moment: { select: { sequence: true } } } });
  const transitions: Transition[] = rows.map(row => ({ id: row.id, entityId: row.entityId, sequence: row.moment.sequence, property: row.property, afterValue: row.afterValue as CanonValue, status: row.status as Transition["status"], dependsOn: ((row.evidence as { dependsOn?: string[] } | null)?.dependsOn ?? []) }));
  return { canonVersion: universe.version, direct: transitionIds, affected: previewConsequences(transitionIds, transitions) };
}
