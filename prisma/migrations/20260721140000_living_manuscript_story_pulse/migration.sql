CREATE TABLE "CanonAnalysisRun" (
  "id" TEXT NOT NULL,
  "universeId" TEXT NOT NULL,
  "sceneId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "revision" INTEGER NOT NULL,
  "manuscriptHash" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "inputSummary" JSONB NOT NULL,
  "warning" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "CanonAnalysisRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CanonProposal" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "entityType" TEXT,
  "entityName" TEXT,
  "entityId" TEXT,
  "property" TEXT,
  "beforeValue" JSONB,
  "afterValue" JSONB,
  "evidence" JSONB NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "perspective" TEXT NOT NULL DEFAULT 'OBJECTIVE',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "resolutionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "CanonProposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CanonMention" (
  "id" TEXT NOT NULL,
  "sceneId" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "momentId" TEXT,
  "blockId" TEXT NOT NULL,
  "quote" TEXT NOT NULL,
  "startOffset" INTEGER NOT NULL,
  "endOffset" INTEGER NOT NULL,
  "revision" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CanonMention_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CanonCommit" (
  "id" TEXT NOT NULL,
  "universeId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "expectedVersion" INTEGER NOT NULL,
  "resultingVersion" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'APPLIED',
  "revertedAt" TIMESTAMP(3),
  "revertedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CanonCommit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CanonCommitItem" (
  "id" TEXT NOT NULL,
  "commitId" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  "transitionId" TEXT,
  "recordType" TEXT NOT NULL,
  "recordId" TEXT NOT NULL,
  "beforeValue" JSONB,
  "afterValue" JSONB,
  CONSTRAINT "CanonCommitItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CanonDependency" (
  "id" TEXT NOT NULL,
  "universeId" TEXT NOT NULL,
  "sourceRecordType" TEXT NOT NULL,
  "sourceRecordId" TEXT NOT NULL,
  "targetRecordType" TEXT NOT NULL,
  "targetRecordId" TEXT NOT NULL,
  "consequenceClass" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "evidence" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CanonDependency_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CanonAnalysisRun_sceneId_requestId_key" ON "CanonAnalysisRun"("sceneId", "requestId");
CREATE INDEX "CanonAnalysisRun_universeId_sceneId_revision_idx" ON "CanonAnalysisRun"("universeId", "sceneId", "revision");
CREATE INDEX "CanonAnalysisRun_requestedById_createdAt_idx" ON "CanonAnalysisRun"("requestedById", "createdAt");
CREATE INDEX "CanonProposal_runId_status_idx" ON "CanonProposal"("runId", "status");
CREATE INDEX "CanonProposal_entityId_property_idx" ON "CanonProposal"("entityId", "property");
CREATE INDEX "CanonMention_sceneId_blockId_revision_idx" ON "CanonMention"("sceneId", "blockId", "revision");
CREATE INDEX "CanonMention_entityId_sceneId_idx" ON "CanonMention"("entityId", "sceneId");
CREATE INDEX "CanonCommit_universeId_createdAt_idx" ON "CanonCommit"("universeId", "createdAt");
CREATE INDEX "CanonCommit_requestedById_idx" ON "CanonCommit"("requestedById");
CREATE UNIQUE INDEX "CanonCommitItem_commitId_proposalId_key" ON "CanonCommitItem"("commitId", "proposalId");
CREATE INDEX "CanonCommitItem_recordType_recordId_idx" ON "CanonCommitItem"("recordType", "recordId");
CREATE UNIQUE INDEX "CanonDependency_universeId_sourceRecordType_sourceRecordId_targetRecordType_targetRecordId_key" ON "CanonDependency"("universeId", "sourceRecordType", "sourceRecordId", "targetRecordType", "targetRecordId");
CREATE INDEX "CanonDependency_universeId_targetRecordType_targetRecordId_active_idx" ON "CanonDependency"("universeId", "targetRecordType", "targetRecordId", "active");
CREATE INDEX "CanonDependency_sourceRecordType_sourceRecordId_active_idx" ON "CanonDependency"("sourceRecordType", "sourceRecordId", "active");
ALTER TABLE "CanonAnalysisRun" ADD CONSTRAINT "CanonAnalysisRun_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CanonAnalysisRun" ADD CONSTRAINT "CanonAnalysisRun_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CanonProposal" ADD CONSTRAINT "CanonProposal_runId_fkey" FOREIGN KEY ("runId") REFERENCES "CanonAnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CanonMention" ADD CONSTRAINT "CanonMention_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CanonMention" ADD CONSTRAINT "CanonMention_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "CanonEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CanonMention" ADD CONSTRAINT "CanonMention_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "CanonMoment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CanonCommit" ADD CONSTRAINT "CanonCommit_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CanonCommitItem" ADD CONSTRAINT "CanonCommitItem_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "CanonCommit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CanonCommitItem" ADD CONSTRAINT "CanonCommitItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "CanonProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CanonCommitItem" ADD CONSTRAINT "CanonCommitItem_transitionId_fkey" FOREIGN KEY ("transitionId") REFERENCES "CanonTransition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CanonDependency" ADD CONSTRAINT "CanonDependency_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
