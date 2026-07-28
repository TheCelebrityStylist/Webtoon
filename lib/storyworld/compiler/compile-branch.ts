import { prisma } from "@/lib/prisma";
import { eventSchema, type NarrativeEvent } from "../domain/types";
import { replayProjection } from "./projection-builder";
import { diagnoseStoryworld } from "./diagnostic-engine";
import { STORYWORLD_COMPILER_VERSION } from "./compiler-version";

const asJson = <T>(value: T) => JSON.parse(JSON.stringify(value));

export function deserializeCanonEvent(record: {
  id: string;
  branchId: string;
  commitId: string;
  eventType: string;
  subjectEntityId: string | null;
  objectEntityId: string | null;
  predicate: string | null;
  valueJson: unknown;
  perspective: string;
  perspectiveEntityId: string | null;
  manuscriptSequence: number;
  storySequence: number | null;
  storyDateStart: Date | null;
  sourceSceneId: string | null;
  evidence: unknown;
  status: string;
}): NarrativeEvent {
  const evidence = Array.isArray(record.evidence) ? record.evidence : record.evidence ? [record.evidence] : [];
  return eventSchema.parse({
    id: record.id,
    branchId: record.branchId,
    commitId: record.commitId,
    type: record.eventType,
    subjectEntityId: record.subjectEntityId ?? undefined,
    objectEntityId: record.objectEntityId ?? undefined,
    predicate: record.predicate ?? undefined,
    value: record.valueJson ?? undefined,
    coordinate: {
      manuscriptSequence: record.manuscriptSequence,
      storySequence: record.storySequence ?? undefined,
      storyDate: record.storyDateStart?.toISOString(),
    },
    perspective: record.perspective.startsWith("CHARACTER_")
      ? { kind: record.perspective, perspectiveEntityId: record.perspectiveEntityId }
      : { kind: record.perspective },
    evidence,
    status: record.status,
  });
}

export async function loadEffectiveBranchEvents(branchId: string): Promise<NarrativeEvent[]> {
  const branch = await prisma.canonBranch.findUnique({ where: { id: branchId }, select: { id: true, parentId: true, forkManuscriptSequence: true } });
  if (!branch) throw Object.assign(new Error("Branch not found"), { code: "BRANCH_NOT_FOUND" });
  const inherited = branch.parentId
    ? (await loadEffectiveBranchEvents(branch.parentId)).filter((event) => event.coordinate.manuscriptSequence <= branch.forkManuscriptSequence)
    : [];
  const records = await prisma.canonEvent.findMany({
    where: { branchId: branch.id, status: { in: ["CONFIRMED", "INTENTIONAL_EXCEPTION"] } },
    orderBy: [{ manuscriptSequence: "asc" }, { createdAt: "asc" }],
  });
  const own = records.map(deserializeCanonEvent);
  const superseded = new Set(own.filter((event) => event.status === "SUPERSEDED" || event.status === "RETRACTED").map((event) => event.id));
  return [...inherited.filter((event) => !superseded.has(event.id)), ...own]
    .sort((a, b) => a.coordinate.manuscriptSequence - b.coordinate.manuscriptSequence || a.id.localeCompare(b.id));
}

export async function compilePersistedBranch(input: {
  projectId: string;
  branchId: string;
  trigger: string;
  earliestAffectedSequence?: number;
}) {
  const branch = await prisma.canonBranch.findFirst({
    where: { id: input.branchId, universe: { seriesId: input.projectId } },
    include: { universe: { select: { id: true } } },
  });
  if (!branch) throw Object.assign(new Error("Branch not found"), { code: "BRANCH_NOT_FOUND" });
  const started = performance.now();
  const run = await prisma.canonCompileRun.create({
    data: {
      universeId: branch.universeId,
      branchId: branch.id,
      trigger: input.trigger,
      earliestAffectedSequence: input.earliestAffectedSequence ?? branch.forkManuscriptSequence,
      compilerVersion: STORYWORLD_COMPILER_VERSION,
      status: "RUNNING",
    },
  });
  try {
    const events = await loadEffectiveBranchEvents(branch.id);
    const projection = replayProjection(branch.id, events);
    const dependencies = await prisma.canonDependency.findMany({ where: { universeId: branch.universeId, active: true } });
    const diagnostics = diagnoseStoryworld(projection, events, dependencies.map((dependency) => ({
      id: dependency.id,
      sourceEventId: dependency.sourceRecordId,
      targetEventId: dependency.targetRecordId,
      type: dependency.consequenceClass === "REQUIRES" ? "REQUIRES" : "CAUSES",
      evidenceIds: [],
    })));
    const duration = Math.round(performance.now() - started);
    await prisma.$transaction(async (tx) => {
      await tx.canonProjection.deleteMany({ where: { branchId: branch.id, atManuscriptSequence: { gte: input.earliestAffectedSequence ?? 0 } } });
      await tx.canonDiagnostic.deleteMany({ where: { branchId: branch.id, status: "OPEN" } });
      for (const [entityId, state] of Object.entries(projection.entities)) {
        await tx.canonProjection.create({
          data: {
            universeId: branch.universeId,
            branchId: branch.id,
            entityId,
            atManuscriptSequence: projection.atManuscriptSequence,
            projectionType: "ENTITY_STATE",
            stateJson: asJson(state),
            sourceCommitId: events.at(-1)?.commitId ?? branch.forkCommitId ?? "baseline",
            compilerVersion: STORYWORLD_COMPILER_VERSION,
          },
        });
      }
      for (const diagnostic of diagnostics) {
        await tx.canonDiagnostic.create({
          data: {
            universeId: branch.universeId,
            branchId: branch.id,
            compileRunId: run.id,
            code: diagnostic.code,
            severity: diagnostic.severity,
            title: diagnostic.title,
            explanation: diagnostic.explanation,
            sourceEntityId: diagnostic.sourceEntityId,
            affectedEntityId: diagnostic.affectedEntityId,
            sourceSceneId: diagnostic.sourceSceneId,
            affectedSceneId: diagnostic.affectedSceneId,
            dependencyPath: diagnostic.dependencyPath,
            evidenceIds: diagnostic.evidence.map((evidence) => evidence.id),
          },
        });
      }
      await tx.canonCompileRun.update({
        where: { id: run.id },
        data: {
          status: "COMPLETED",
          deterministicDurationMs: duration,
          eventCount: events.length,
          projectionCount: Object.keys(projection.entities).length,
          diagnosticCount: diagnostics.length,
          completedAt: new Date(),
        },
      });
    });
    return { runId: run.id, projection, diagnostics, deterministicDurationMs: duration };
  } catch (error) {
    await prisma.canonCompileRun.update({ where: { id: run.id }, data: { status: "FAILED", errorCode: error instanceof Error ? error.name : "COMPILE_FAILED", completedAt: new Date() } });
    throw error;
  }
}
