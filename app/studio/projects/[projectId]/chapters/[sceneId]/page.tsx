import { notFound } from "next/navigation";
import { ManuscriptEditor } from "@/components/ManuscriptEditor";
import { prisma } from "@/lib/prisma";

export default async function ScenePage({ params }: { params: Promise<{ projectId: string; sceneId: string }> }) {
  const { projectId, sceneId } = await params;
  const scene = await prisma.scene.findFirst({
    where: { id: sceneId, chapter: { seriesId: projectId }, deletedAt: null },
    include: { chapter: { include: { series: { select: { title: true } } } } },
  });
  if (!scene) notFound();
  return <main className="story-workspace">
    <ManuscriptEditor
      projectId={projectId}
      sceneId={sceneId}
      projectTitle={scene.chapter.series.title}
      sceneTitle={scene.title}
      initialDocument={scene.manuscriptJson as Record<string, unknown>}
      initialRevision={scene.revision}
    />
  </main>;
}
