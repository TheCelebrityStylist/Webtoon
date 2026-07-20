"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/server/authorization";
import { requireUser } from "@/server/session";

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

export async function quickCreate(data: FormData) {
  const user = await requireUser();
  const projectId = text(data, "projectId");
  const kind = text(data, "kind");
  const name = text(data, "name");
  if (!projectId || !name) return;
  await requireProjectAccess(user.id, projectId, ["OWNER", "WRITER", "EDITOR"]);

  if (kind === "character") {
    const item = await prisma.character.create({ data: { seriesId: projectId, name, role: text(data, "detail") || "Supporting", aliases: "", pronouns: "", lifeStage: "", appearance: "", personality: "", speechStyle: "", motivations: "", goals: "", fears: "", secrets: "" } });
    redirect(`/studio/projects/${projectId}/characters?selected=${item.id}`);
  }
  if (kind === "place") {
    const item = await prisma.location.create({ data: { seriesId: projectId, name, description: text(data, "detail") } });
    redirect(`/studio/projects/${projectId}/places?selected=${item.id}`);
  }
  if (kind === "chapter") {
    const last = await prisma.chapter.aggregate({ where: { seriesId: projectId, deletedAt: null }, _max: { number: true } });
    await prisma.chapter.create({ data: { seriesId: projectId, title: name, number: (last._max.number ?? 0) + 1, kind: "CHAPTER" } });
    redirect(`/studio/projects/${projectId}/chapters`);
  }
  if (kind === "scene") {
    let chapter = await prisma.chapter.findFirst({ where: { seriesId: projectId, deletedAt: null }, orderBy: { number: "asc" } });
    if (!chapter) chapter = await prisma.chapter.create({ data: { seriesId: projectId, title: "Chapter 1", number: 1, kind: "CHAPTER" } });
    const last = await prisma.scene.aggregate({ where: { chapterId: chapter.id, deletedAt: null }, _max: { position: true } });
    const item = await prisma.scene.create({ data: { chapterId: chapter.id, title: name, position: (last._max.position ?? 0) + 1 } });
    redirect(`/studio/projects/${projectId}/chapters/${item.id}`);
  }
  if (kind === "event") {
    const last = await prisma.timelineEvent.aggregate({ where: { seriesId: projectId }, _max: { chronology: true } });
    await prisma.timelineEvent.create({ data: { seriesId: projectId, title: name, chronology: (last._max.chronology ?? 0) + 1, causeIds: [] } });
    redirect(`/studio/projects/${projectId}/timeline`);
  }
  if (kind === "object") {
    await prisma.storyObject.create({ data: { seriesId: projectId, name, kind: text(data, "detail") || "Object" } });
    redirect(`/studio/projects/${projectId}/world`);
  }
  if (kind === "thread") {
    const scene = await prisma.scene.findFirst({ where: { chapter: { seriesId: projectId }, deletedAt: null }, orderBy: { createdAt: "asc" } });
    if (!scene) redirect(`/studio/projects/${projectId}/chapters`);
    await prisma.plotThread.create({ data: { seriesId: projectId, title: name, sourceSceneId: scene.id } });
    redirect(`/studio/projects/${projectId}/plan`);
  }
}
