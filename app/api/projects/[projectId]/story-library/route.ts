import { auth } from "@/auth";
import { ensureCanonUniverse } from "@/lib/canon/repository";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/server/authorization";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  try {
    await requireProjectAccess(session.user.id, projectId);
    const universe = await ensureCanonUniverse(projectId);
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim() ?? "";
    const type = url.searchParams.get("type")?.toUpperCase();
    const entities = await prisma.canonEntity.findMany({
      where: { universeId: universe.id, deletedAt: null, ...(query ? { name: { contains: query, mode: "insensitive" } } : {}), ...(type && type !== "ALL" ? { entityType: type } : {}) },
      include: { mentions: { where: { active: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return Response.json({ entities: entities.map((entity) => ({ id: entity.id, name: entity.name, type: entity.entityType, currentState: entity.metadata, recentAppearance: entity.mentions[0] ?? null, sourceCount: entity.mentions.length })) }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
}
