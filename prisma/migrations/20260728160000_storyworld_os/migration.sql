-- CreateEnum
CREATE TYPE "StoryworldBranchStatus" AS ENUM ('ACTIVE', 'MERGED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NarrativeTruthStatus" AS ENUM ('PROPOSED', 'CONFIRMED', 'INTENTIONAL_EXCEPTION', 'SUPERSEDED', 'RETRACTED');

-- CreateEnum
CREATE TYPE "NarrativePerspective" AS ENUM ('REALITY', 'NARRATOR', 'READER', 'CHARACTER_KNOWLEDGE', 'CHARACTER_BELIEF', 'CHARACTER_DECEPTION');

-- CreateEnum
CREATE TYPE "NarrativeSeverity" AS ENUM ('INFO', 'RISK', 'BLOCKER');

-- CreateEnum
CREATE TYPE "StoryworldRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "StoryworldMergeStatus" AS ENUM ('PREVIEW', 'APPLIED', 'REVERTED', 'ABORTED');

-- AlterTable
ALTER TABLE "CanonBranch" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "forkCommitId" TEXT,
ADD COLUMN     "forkManuscriptSequence" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "initiatingEvidence" JSONB,
ADD COLUMN     "mergedAt" TIMESTAMP(3),
ADD COLUMN     "status" "StoryworldBranchStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "SceneCollaborativeDocument" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "branchId" TEXT,
    "snapshot" BYTEA NOT NULL,
    "stateVector" BYTEA NOT NULL,
    "snapshotSequence" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SceneCollaborativeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneCollaborativeUpdate" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "updateBytes" BYTEA NOT NULL,
    "mutationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SceneCollaborativeUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneDocumentCheckpoint" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "manuscriptJson" JSONB NOT NULL,
    "manuscriptText" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SceneDocumentCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonEvent" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "commitId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "subjectEntityId" TEXT,
    "objectEntityId" TEXT,
    "predicate" TEXT,
    "valueJson" JSONB,
    "perspective" "NarrativePerspective" NOT NULL,
    "perspectiveEntityId" TEXT,
    "manuscriptSequence" INTEGER NOT NULL,
    "storySequence" INTEGER,
    "storyDateStart" TIMESTAMP(3),
    "storyDateEnd" TIMESTAMP(3),
    "sourceSceneId" TEXT,
    "evidenceId" TEXT,
    "evidence" JSONB,
    "status" "NarrativeTruthStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanonEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonProjection" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "atManuscriptSequence" INTEGER NOT NULL,
    "projectionType" TEXT NOT NULL,
    "stateJson" JSONB NOT NULL,
    "sourceCommitId" TEXT NOT NULL,
    "compilerVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanonProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonDiagnostic" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "compileRunId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "severity" "NarrativeSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourceEntityId" TEXT,
    "affectedEntityId" TEXT,
    "sourceSceneId" TEXT,
    "affectedSceneId" TEXT,
    "dependencyPath" JSONB NOT NULL,
    "evidenceIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "CanonDiagnostic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonCompileRun" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "earliestAffectedSequence" INTEGER NOT NULL,
    "latestAffectedSequence" INTEGER,
    "compilerVersion" TEXT NOT NULL,
    "status" "StoryworldRunStatus" NOT NULL DEFAULT 'PENDING',
    "deterministicDurationMs" INTEGER,
    "providerDurationMs" INTEGER,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "projectionCount" INTEGER NOT NULL DEFAULT 0,
    "diagnosticCount" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CanonCompileRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchSceneOverride" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "baseCheckpointId" TEXT NOT NULL,
    "branchDocumentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchSceneOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchMerge" (
    "id" TEXT NOT NULL,
    "sourceBranchId" TEXT NOT NULL,
    "targetBranchId" TEXT NOT NULL,
    "baseCommitId" TEXT NOT NULL,
    "mergeCommitId" TEXT,
    "selectedChanges" JSONB NOT NULL,
    "inverseChanges" JSONB,
    "status" "StoryworldMergeStatus" NOT NULL DEFAULT 'PREVIEW',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BranchMerge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SceneCollaborativeDocument_sceneId_updatedAt_idx" ON "SceneCollaborativeDocument"("sceneId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SceneCollaborativeDocument_sceneId_branchId_key" ON "SceneCollaborativeDocument"("sceneId", "branchId");

-- CreateIndex
CREATE INDEX "SceneCollaborativeUpdate_documentId_createdAt_idx" ON "SceneCollaborativeUpdate"("documentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SceneCollaborativeUpdate_documentId_sequence_key" ON "SceneCollaborativeUpdate"("documentId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "SceneCollaborativeUpdate_documentId_mutationId_key" ON "SceneCollaborativeUpdate"("documentId", "mutationId");

-- CreateIndex
CREATE INDEX "SceneDocumentCheckpoint_documentId_createdAt_idx" ON "SceneDocumentCheckpoint"("documentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SceneDocumentCheckpoint_documentId_sequence_key" ON "SceneDocumentCheckpoint"("documentId", "sequence");

-- CreateIndex
CREATE INDEX "CanonEvent_universeId_branchId_manuscriptSequence_idx" ON "CanonEvent"("universeId", "branchId", "manuscriptSequence");

-- CreateIndex
CREATE INDEX "CanonEvent_branchId_subjectEntityId_eventType_idx" ON "CanonEvent"("branchId", "subjectEntityId", "eventType");

-- CreateIndex
CREATE INDEX "CanonEvent_sourceSceneId_status_idx" ON "CanonEvent"("sourceSceneId", "status");

-- CreateIndex
CREATE INDEX "CanonEvent_commitId_idx" ON "CanonEvent"("commitId");

-- CreateIndex
CREATE INDEX "CanonProjection_universeId_branchId_atManuscriptSequence_idx" ON "CanonProjection"("universeId", "branchId", "atManuscriptSequence");

-- CreateIndex
CREATE INDEX "CanonProjection_branchId_projectionType_idx" ON "CanonProjection"("branchId", "projectionType");

-- CreateIndex
CREATE UNIQUE INDEX "CanonProjection_branchId_entityId_atManuscriptSequence_proj_key" ON "CanonProjection"("branchId", "entityId", "atManuscriptSequence", "projectionType");

-- CreateIndex
CREATE INDEX "CanonDiagnostic_branchId_severity_status_idx" ON "CanonDiagnostic"("branchId", "severity", "status");

-- CreateIndex
CREATE INDEX "CanonDiagnostic_compileRunId_idx" ON "CanonDiagnostic"("compileRunId");

-- CreateIndex
CREATE INDEX "CanonDiagnostic_affectedSceneId_idx" ON "CanonDiagnostic"("affectedSceneId");

-- CreateIndex
CREATE INDEX "CanonCompileRun_branchId_createdAt_idx" ON "CanonCompileRun"("branchId", "createdAt");

-- CreateIndex
CREATE INDEX "CanonCompileRun_universeId_status_idx" ON "CanonCompileRun"("universeId", "status");

-- CreateIndex
CREATE INDEX "BranchSceneOverride_sceneId_status_idx" ON "BranchSceneOverride"("sceneId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BranchSceneOverride_branchId_sceneId_key" ON "BranchSceneOverride"("branchId", "sceneId");

-- CreateIndex
CREATE INDEX "BranchMerge_sourceBranchId_status_idx" ON "BranchMerge"("sourceBranchId", "status");

-- CreateIndex
CREATE INDEX "BranchMerge_targetBranchId_createdAt_idx" ON "BranchMerge"("targetBranchId", "createdAt");

-- CreateIndex
CREATE INDEX "CanonBranch_universeId_status_createdAt_idx" ON "CanonBranch"("universeId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CanonBranch_parentId_idx" ON "CanonBranch"("parentId");

-- AddForeignKey
ALTER TABLE "CanonBranch" ADD CONSTRAINT "CanonBranch_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CanonBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneCollaborativeDocument" ADD CONSTRAINT "SceneCollaborativeDocument_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneCollaborativeUpdate" ADD CONSTRAINT "SceneCollaborativeUpdate_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SceneCollaborativeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneDocumentCheckpoint" ADD CONSTRAINT "SceneDocumentCheckpoint_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SceneCollaborativeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonEvent" ADD CONSTRAINT "CanonEvent_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonEvent" ADD CONSTRAINT "CanonEvent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "CanonBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonEvent" ADD CONSTRAINT "CanonEvent_sourceSceneId_fkey" FOREIGN KEY ("sourceSceneId") REFERENCES "Scene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonProjection" ADD CONSTRAINT "CanonProjection_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonProjection" ADD CONSTRAINT "CanonProjection_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "CanonBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonDiagnostic" ADD CONSTRAINT "CanonDiagnostic_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonDiagnostic" ADD CONSTRAINT "CanonDiagnostic_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "CanonBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonDiagnostic" ADD CONSTRAINT "CanonDiagnostic_compileRunId_fkey" FOREIGN KEY ("compileRunId") REFERENCES "CanonCompileRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonCompileRun" ADD CONSTRAINT "CanonCompileRun_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonCompileRun" ADD CONSTRAINT "CanonCompileRun_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "CanonBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSceneOverride" ADD CONSTRAINT "BranchSceneOverride_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "CanonBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSceneOverride" ADD CONSTRAINT "BranchSceneOverride_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSceneOverride" ADD CONSTRAINT "BranchSceneOverride_baseCheckpointId_fkey" FOREIGN KEY ("baseCheckpointId") REFERENCES "SceneDocumentCheckpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSceneOverride" ADD CONSTRAINT "BranchSceneOverride_branchDocumentId_fkey" FOREIGN KEY ("branchDocumentId") REFERENCES "SceneCollaborativeDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchMerge" ADD CONSTRAINT "BranchMerge_sourceBranchId_fkey" FOREIGN KEY ("sourceBranchId") REFERENCES "CanonBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchMerge" ADD CONSTRAINT "BranchMerge_targetBranchId_fkey" FOREIGN KEY ("targetBranchId") REFERENCES "CanonBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
