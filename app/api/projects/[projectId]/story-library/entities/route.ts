import { z } from "zod";
import { auth } from "@/auth";
import { createLegacyEntity } from "@/lib/canon/apply-proposals";
import { ensureCanonUniverse } from "@/lib/canon/repository";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/server/authorization";

const inputSchema = z.object({ name: z.string().trim().min(1).max(240), type: z.enum(["CHARACTER", "PLACE", "OBJECT", "EVENT"]), sceneId: z.string().min(1), role: z.string().max(120).optional(), parent: z.string().max(240).optional(), owner: z.string().max(240).optional(), location: z.string().max(240).optional(), position: z.number().int().optional(), date: z.string().datetime().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  try {
    await requireProjectAccess(session.user.id, projectId, ["OWNER", "WRITER", "EDITOR"]);
    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Check the story record details", details: parsed.error.flatten() }, { status: 400 });
    const universe = await ensureCanonUniverse(projectId);
    const entity = await prisma.$transaction(async (tx) => {
      const legacy = await createLegacyEntity(tx, projectId, parsed.data.type, parsed.data.name, parsed.data.sceneId, parsed.data.position ?? Date.now());
      const canon = await tx.canonEntity.upsert({ where: { universeId_sourceType_sourceId: { universeId: universe.id, sourceType: parsed.data.type, sourceId: legacy.id } }, create: { universeId: universe.id, entityType: parsed.data.type, name: parsed.data.name, sourceType: parsed.data.type, sourceId: legacy.id, metadata: { role: parsed.data.role, parent: parsed.data.parent, owner: parsed.data.owner, location: parsed.data.location, date: parsed.data.date } }, update: { name: parsed.data.name, deletedAt: null } });
      await tx.canonUniverse.update({ where: { id: universe.id }, data: { version: { increment: 1 } } });
      return canon;
    });
    return Response.json({ entity, undo: { entityId: entity.id, canonVersion: universe.version + 1 } }, { status: 201 });
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
}
