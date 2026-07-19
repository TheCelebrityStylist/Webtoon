import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/server/authorization";

export async function loadExportManuscript(userId: string, projectId: string) {
  await requireProjectAccess(userId, projectId);
  return prisma.series.findFirst({
    where: { id: projectId, deletedAt: null },
    select: {
      title: true,
      premise: true,
      chapters: {
        where: { deletedAt: null },
        orderBy: { number: "asc" },
        select: {
          number: true,
          title: true,
          scenes: { where: { deletedAt: null }, orderBy: { position: "asc" }, select: { title: true, manuscriptText: true } },
        },
      },
    },
  });
}

export function safeFilename(title: string) {
  return title.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "manuscript";
}
