-- CreateTable
CREATE TABLE "CanonUniverse" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanonUniverse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonEntity" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "customType" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CanonEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonMoment" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "branchId" TEXT,
    "sceneId" TEXT,
    "sequence" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "manuscriptOrder" INTEGER,
    "readerOrder" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanonMoment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonTransition" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "property" TEXT NOT NULL,
    "beforeValue" JSONB,
    "afterValue" JSONB NOT NULL,
    "evidence" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "supersedesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanonTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonFact" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "subjectEntityId" TEXT,
    "perspective" TEXT NOT NULL,
    "perspectiveEntityId" TEXT,
    "predicate" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "evidence" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "importance" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanonFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonEdge" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "fromEntityId" TEXT NOT NULL,
    "toEntityId" TEXT NOT NULL,
    "edgeType" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CanonEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonBranch" (
    "id" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "forkSequence" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanonBranch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanonUniverse_seriesId_key" ON "CanonUniverse"("seriesId");

-- CreateIndex
CREATE INDEX "CanonEntity_universeId_entityType_deletedAt_idx" ON "CanonEntity"("universeId", "entityType", "deletedAt");

-- CreateIndex
CREATE INDEX "CanonEntity_universeId_name_idx" ON "CanonEntity"("universeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CanonEntity_universeId_sourceType_sourceId_key" ON "CanonEntity"("universeId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "CanonMoment_universeId_occurredAt_idx" ON "CanonMoment"("universeId", "occurredAt");

-- CreateIndex
CREATE INDEX "CanonMoment_sceneId_idx" ON "CanonMoment"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "CanonMoment_universeId_branchId_sequence_key" ON "CanonMoment"("universeId", "branchId", "sequence");

-- CreateIndex
CREATE INDEX "CanonTransition_entityId_property_momentId_idx" ON "CanonTransition"("entityId", "property", "momentId");

-- CreateIndex
CREATE INDEX "CanonTransition_momentId_status_idx" ON "CanonTransition"("momentId", "status");

-- CreateIndex
CREATE INDEX "CanonFact_universeId_perspective_perspectiveEntityId_predic_idx" ON "CanonFact"("universeId", "perspective", "perspectiveEntityId", "predicate");

-- CreateIndex
CREATE INDEX "CanonFact_subjectEntityId_predicate_idx" ON "CanonFact"("subjectEntityId", "predicate");

-- CreateIndex
CREATE INDEX "CanonFact_momentId_status_idx" ON "CanonFact"("momentId", "status");

-- CreateIndex
CREATE INDEX "CanonEdge_toEntityId_edgeType_idx" ON "CanonEdge"("toEntityId", "edgeType");

-- CreateIndex
CREATE UNIQUE INDEX "CanonEdge_universeId_fromEntityId_toEntityId_edgeType_key" ON "CanonEdge"("universeId", "fromEntityId", "toEntityId", "edgeType");

-- CreateIndex
CREATE UNIQUE INDEX "CanonBranch_universeId_name_key" ON "CanonBranch"("universeId", "name");

-- AddForeignKey
ALTER TABLE "CanonUniverse" ADD CONSTRAINT "CanonUniverse_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonEntity" ADD CONSTRAINT "CanonEntity_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonMoment" ADD CONSTRAINT "CanonMoment_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonMoment" ADD CONSTRAINT "CanonMoment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "CanonBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonTransition" ADD CONSTRAINT "CanonTransition_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "CanonEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonTransition" ADD CONSTRAINT "CanonTransition_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "CanonMoment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonFact" ADD CONSTRAINT "CanonFact_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonFact" ADD CONSTRAINT "CanonFact_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "CanonMoment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonEdge" ADD CONSTRAINT "CanonEdge_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonEdge" ADD CONSTRAINT "CanonEdge_fromEntityId_fkey" FOREIGN KEY ("fromEntityId") REFERENCES "CanonEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonEdge" ADD CONSTRAINT "CanonEdge_toEntityId_fkey" FOREIGN KEY ("toEntityId") REFERENCES "CanonEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonBranch" ADD CONSTRAINT "CanonBranch_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "CanonUniverse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

