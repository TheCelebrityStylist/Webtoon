-- Commercial Story Workspace: first-class parts, ordered chapters, scene metadata,
-- and conflict-safe Google synchronization metadata.
ALTER TABLE "IntegrationConnection" ADD COLUMN "driveStartPageToken" TEXT;

CREATE TABLE "StoryPart" (
  "id" TEXT NOT NULL,
  "seriesId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "StoryPart_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StoryPart_seriesId_position_idx" ON "StoryPart"("seriesId", "position");
CREATE INDEX "StoryPart_seriesId_deletedAt_idx" ON "StoryPart"("seriesId", "deletedAt");
ALTER TABLE "StoryPart" ADD CONSTRAINT "StoryPart_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Chapter" ADD COLUMN "partId" TEXT;
ALTER TABLE "Chapter" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Chapter" ADD COLUMN "summary" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Chapter" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
WITH ranked AS (SELECT "id", ROW_NUMBER() OVER (PARTITION BY "seriesId" ORDER BY "number") - 1 AS value FROM "Chapter") UPDATE "Chapter" SET "position" = ranked.value FROM ranked WHERE "Chapter"."id" = ranked."id";
CREATE INDEX "Chapter_seriesId_position_idx" ON "Chapter"("seriesId", "position");
CREATE INDEX "Chapter_partId_position_idx" ON "Chapter"("partId", "position");
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_partId_fkey" FOREIGN KEY ("partId") REFERENCES "StoryPart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Scene" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Scene" ADD COLUMN "pointOfViewEntityId" TEXT;
ALTER TABLE "Scene" ADD COLUMN "locationEntityId" TEXT;
ALTER TABLE "Scene" ADD COLUMN "wordCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Scene" ADD COLUMN "lastEditedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "Scene" SET "wordCount" = CASE WHEN trim("manuscriptText") = '' THEN 0 ELSE array_length(regexp_split_to_array(trim("manuscriptText"), '\\s+'), 1) END;

ALTER TABLE "GoogleDocumentReference" ADD COLUMN "documentUrl" TEXT;
ALTER TABLE "GoogleDocumentReference" ADD COLUMN "revisionId" TEXT;
ALTER TABLE "GoogleDocumentReference" ADD COLUMN "driveVersion" TEXT;
ALTER TABLE "GoogleDocumentReference" ADD COLUMN "modifiedTime" TIMESTAMP(3);
ALTER TABLE "GoogleDocumentReference" ADD COLUMN "canonVersion" INTEGER;
ALTER TABLE "GoogleDocumentReference" ADD COLUMN "manuscriptRevision" INTEGER;
ALTER TABLE "GoogleDocumentReference" ADD COLUMN "namedRanges" JSONB;
ALTER TABLE "GoogleDocumentReference" ADD COLUMN "syncStatus" TEXT NOT NULL DEFAULT 'CONNECTED';
ALTER TABLE "GoogleDocumentReference" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);
ALTER TABLE "GoogleDocumentReference" ADD COLUMN "lastCheckedAt" TIMESTAMP(3);
