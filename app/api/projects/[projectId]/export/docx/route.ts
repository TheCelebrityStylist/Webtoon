import { auth } from "@/auth";
import { createDocx, exportChecksum } from "@/lib/exports/manuscript";
import { loadExportManuscript, safeFilename } from "@/lib/exports/project";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in to continue" }, { status: 401 });
  const { projectId } = await params;
  const project = await loadExportManuscript(session.user.id, projectId);
  if (!project) return Response.json({ error: "Story not found" }, { status: 404 });
  const bytes = await createDocx({ title: project.title, premise: project.premise, chapters: project.chapters });
  const checksum = exportChecksum(bytes);
  await prisma.exportJob.create({ data: { seriesId: projectId, userId: session.user.id, format: "DOCX", status: "COMPLETED", checksum, completedAt: new Date() } });
  return new Response(new Blob([new Uint8Array(bytes)]), { headers: { "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "content-disposition": `attachment; filename="${safeFilename(project.title)}.docx"`, "x-content-checksum": checksum } });
}
