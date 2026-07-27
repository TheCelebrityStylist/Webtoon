import { z } from "zod";
import { auth } from "@/auth";
import { createLegacyEntity } from "@/lib/canon/apply-proposals";
import { ensureCanonUniverse } from "@/lib/canon/repository";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/server/authorization";
import { toCanonEntityType } from "@/lib/story-canvas/entity-types";

const idList = z.array(z.string().min(1)).max(100).optional();
const inputSchema = z.object({ name: z.string().trim().min(1).max(240), type: z.enum(["person", "place", "object", "event", "faction", "question", "CHARACTER", "PLACE", "OBJECT", "EVENT", "FACTION", "QUESTION"]), sceneId: z.string().min(1).optional(), role: z.string().max(120).optional(), pronouns: z.string().max(80).optional(), description: z.string().max(500).optional(), atmosphere: z.string().max(500).optional(), parent: z.string().max(240).optional(), currentOwner: z.string().max(240).optional(), currentHolder: z.string().max(240).optional(), currentLocation: z.string().max(240).optional(), position: z.number().int().optional(), date: z.string().datetime().optional(), goals: z.array(z.string().trim().min(1).max(240)).max(50).optional(), memberIds: idList, leaderId: z.string().min(1).optional(), allyIds: idList, enemyIds: idList, introducedSceneId: z.string().min(1).optional(), relatedEntityIds: idList, expectedPayoff: z.string().max(500).optional(), resolvedSceneId: z.string().min(1).optional(), sourceEvidence: z.string().max(2000).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  try {
    await requireProjectAccess(session.user.id, projectId, ["OWNER", "WRITER", "EDITOR"]);
    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Check the story record details", details: parsed.error.flatten() }, { status: 400 });
    const universe = await ensureCanonUniverse(projectId);
    const type = toCanonEntityType(parsed.data.type);
    const sceneId = parsed.data.sceneId ?? (await prisma.scene.findFirst({ where: { chapter: { seriesId: projectId }, deletedAt: null }, orderBy: [{ chapter: { position: "asc" } }, { position: "asc" }], select: { id: true } }))?.id;
    if (!sceneId && type === "EVENT") return Response.json({ error: "Create a scene before adding a timeline event" }, { status: 422 });
    const entity = await prisma.$transaction(async (tx) => {
      const legacy = sceneId ? await createLegacyEntity(tx, projectId, type, parsed.data.name, sceneId, parsed.data.position ?? Date.now()) : null;
      const sourceId = legacy?.id ?? crypto.randomUUID();
      const canon = await tx.canonEntity.upsert({ where: { universeId_sourceType_sourceId: { universeId: universe.id, sourceType: type, sourceId } }, create: { universeId: universe.id, entityType: type, name: parsed.data.name, sourceType: type, sourceId, metadata: { role: parsed.data.role, pronouns: parsed.data.pronouns, description: parsed.data.description, atmosphere: parsed.data.atmosphere, parent: parsed.data.parent, owner: parsed.data.currentOwner, holder: parsed.data.currentHolder, location: parsed.data.currentLocation, date: parsed.data.date, goals: parsed.data.goals, memberIds: parsed.data.memberIds, leaderId: parsed.data.leaderId, allyIds: parsed.data.allyIds, enemyIds: parsed.data.enemyIds, introducedSceneId: parsed.data.introducedSceneId, relatedEntityIds: parsed.data.relatedEntityIds, expectedPayoff: parsed.data.expectedPayoff, resolvedSceneId: parsed.data.resolvedSceneId, sourceEvidence: parsed.data.sourceEvidence } }, update: { name: parsed.data.name, deletedAt: null } });
      await tx.canonUniverse.update({ where: { id: universe.id }, data: { version: { increment: 1 } } });
      return canon;
    });
    return Response.json({ ...parsed.data, id: entity.id, name: entity.name, type: parsed.data.type.toLowerCase() === "character" ? "person" : parsed.data.type.toLowerCase(), aliases: [], appearances: sceneId ? [sceneId] : [], sceneIds: sceneId ? [sceneId] : [], sourceCount: sceneId ? 1 : 0, status: "active", undo: { entityId: entity.id, canonVersion: universe.version + 1 } }, { status: 201 });
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
}
