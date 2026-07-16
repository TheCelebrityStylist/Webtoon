CREATE TABLE "SceneMutation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "sceneId" TEXT NOT NULL,
  "mutationId" TEXT NOT NULL,
  "revision" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "SceneMutation_userId_mutationId_key" ON "SceneMutation"("userId", "mutationId");
CREATE INDEX "SceneMutation_sceneId_createdAt_idx" ON "SceneMutation"("sceneId", "createdAt");
CREATE TABLE "OAuthState" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "nonceHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "OAuthState_nonceHash_key" ON "OAuthState"("nonceHash");
CREATE INDEX "OAuthState_userId_expiresAt_idx" ON "OAuthState"("userId", "expiresAt");
