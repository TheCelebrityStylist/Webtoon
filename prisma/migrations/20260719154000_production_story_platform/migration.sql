-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INCOMPLETE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "monthlyPriceId" TEXT NOT NULL,
    "annualPriceId" TEXT NOT NULL,
    "entitlements" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryBranch" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceVersion" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterState" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "sceneId" TEXT,
    "kind" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),

    CONSTRAINT "CharacterState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterKnowledge" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "factKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sourceSceneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterBelief" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "factKey" TEXT NOT NULL,
    "belief" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sourceSceneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterBelief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContinuityFact" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT,
    "predicate" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "truthStatus" TEXT NOT NULL,
    "sourceQuote" TEXT NOT NULL,
    "intentional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContinuityFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContinuityIssue" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "passage" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "affectedRecords" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ContinuityIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "sceneId" TEXT,
    "title" TEXT NOT NULL,
    "chronology" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "durationMin" INTEGER,
    "causeIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryObject" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoryObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectState" (
    "id" TEXT NOT NULL,
    "storyObjectId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "ownerId" TEXT,
    "locationId" TEXT,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObjectState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlotThread" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "sourceSceneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlotThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NarrativePromise" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "setupSceneId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "payoffSceneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NarrativePromise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionFinding" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "passage" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "recommendation" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleDocumentReference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lastExportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleDocumentReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleCalendarReference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL DEFAULT 'primary',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleCalendarReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "mapping" JSONB,
    "result" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "checksum" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "seriesId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeProductId_key" ON "Plan"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_monthlyPriceId_key" ON "Plan"("monthlyPriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_annualPriceId_key" ON "Plan"("annualPriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StoryBranch_seriesId_name_key" ON "StoryBranch"("seriesId", "name");

-- CreateIndex
CREATE INDEX "CharacterState_characterId_kind_validTo_idx" ON "CharacterState"("characterId", "kind", "validTo");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterKnowledge_characterId_factKey_sourceSceneId_key" ON "CharacterKnowledge"("characterId", "factKey", "sourceSceneId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterBelief_characterId_factKey_sourceSceneId_key" ON "CharacterBelief"("characterId", "factKey", "sourceSceneId");

-- CreateIndex
CREATE INDEX "ContinuityFact_seriesId_subjectType_subjectId_predicate_idx" ON "ContinuityFact"("seriesId", "subjectType", "subjectId", "predicate");

-- CreateIndex
CREATE INDEX "ContinuityFact_sceneId_idx" ON "ContinuityFact"("sceneId");

-- CreateIndex
CREATE INDEX "ContinuityIssue_seriesId_status_importance_idx" ON "ContinuityIssue"("seriesId", "status", "importance");

-- CreateIndex
CREATE INDEX "ContinuityIssue_sceneId_status_idx" ON "ContinuityIssue"("sceneId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineEvent_seriesId_chronology_key" ON "TimelineEvent"("seriesId", "chronology");

-- CreateIndex
CREATE UNIQUE INDEX "StoryObject_seriesId_name_key" ON "StoryObject"("seriesId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectState_storyObjectId_sceneId_key" ON "ObjectState"("storyObjectId", "sceneId");

-- CreateIndex
CREATE INDEX "PlotThread_seriesId_status_idx" ON "PlotThread"("seriesId", "status");

-- CreateIndex
CREATE INDEX "NarrativePromise_seriesId_status_idx" ON "NarrativePromise"("seriesId", "status");

-- CreateIndex
CREATE INDEX "RevisionFinding_seriesId_status_category_idx" ON "RevisionFinding"("seriesId", "status", "category");

-- CreateIndex
CREATE INDEX "GoogleDocumentReference_seriesId_kind_idx" ON "GoogleDocumentReference"("seriesId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleDocumentReference_userId_googleId_key" ON "GoogleDocumentReference"("userId", "googleId");

-- CreateIndex
CREATE INDEX "GoogleCalendarReference_seriesId_idx" ON "GoogleCalendarReference"("seriesId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarReference_userId_calendarId_eventId_key" ON "GoogleCalendarReference"("userId", "calendarId", "eventId");

-- CreateIndex
CREATE INDEX "ImportJob_seriesId_status_idx" ON "ImportJob"("seriesId", "status");

-- CreateIndex
CREATE INDEX "ExportJob_seriesId_status_idx" ON "ExportJob"("seriesId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_seriesId_createdAt_idx" ON "AuditLog"("seriesId", "createdAt");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryBranch" ADD CONSTRAINT "StoryBranch_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterState" ADD CONSTRAINT "CharacterState_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterKnowledge" ADD CONSTRAINT "CharacterKnowledge_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterBelief" ADD CONSTRAINT "CharacterBelief_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContinuityFact" ADD CONSTRAINT "ContinuityFact_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContinuityFact" ADD CONSTRAINT "ContinuityFact_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContinuityIssue" ADD CONSTRAINT "ContinuityIssue_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContinuityIssue" ADD CONSTRAINT "ContinuityIssue_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryObject" ADD CONSTRAINT "StoryObject_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectState" ADD CONSTRAINT "ObjectState_storyObjectId_fkey" FOREIGN KEY ("storyObjectId") REFERENCES "StoryObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotThread" ADD CONSTRAINT "PlotThread_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NarrativePromise" ADD CONSTRAINT "NarrativePromise_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionFinding" ADD CONSTRAINT "RevisionFinding_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionFinding" ADD CONSTRAINT "RevisionFinding_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
