import type { CanvasScene, StoryChapter, StoryPart, StoryProject, StructureCommand } from "./types";

const stamp = () => new Date().toISOString();
const id = (kind: string) => `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const normalize = (project: StoryProject): StoryProject => {
  const chapters = project.chapters.map((chapter, position) => ({ ...chapter, position })).sort((a, b) => a.position - b.position);
  const scenes = project.scenes.map((scene) => ({ ...scene, order: chapters.findIndex((chapter) => chapter.id === scene.chapterId) * 1000 + scene.position }));
  return { ...project, chapters, scenes, parts: project.parts.map((part, position) => ({ ...part, position, chapterIds: chapters.filter((chapter) => chapter.partId === part.id).map((chapter) => chapter.id) })), updatedAt: stamp() };
};

export function createPartRecord(project: StoryProject, title = "Untitled part", position = project.parts.length): { project: StoryProject; part: StoryPart } {
  const part: StoryPart = { id: id("part"), projectId: project.id, title, position, chapterIds: [], status: "active" };
  const parts = [...project.parts]; parts.splice(Math.max(0, Math.min(position, parts.length)), 0, part);
  return { project: normalize({ ...project, parts }), part };
}

export function createChapterRecord(project: StoryProject, title = "Untitled chapter", partId?: string, position = project.chapters.length): { project: StoryProject; chapter: StoryChapter } {
  const createdAt = stamp();
  const chapter: StoryChapter = { id: id("chapter"), projectId: project.id, partId, title, position, summary: "", status: "active", sceneIds: [], createdAt, updatedAt: createdAt };
  const chapters = [...project.chapters]; chapters.splice(Math.max(0, Math.min(position, chapters.length)), 0, chapter);
  return { project: normalize({ ...project, chapters }), chapter };
}

export function createSceneRecord(project: StoryProject, chapterId: string, title = "Untitled scene", position?: number): { project: StoryProject; scene: CanvasScene } {
  const siblings = project.scenes.filter((item) => item.chapterId === chapterId && item.status !== "archived");
  const at = position ?? siblings.length;
  const created: CanvasScene = { id: id("scene"), chapterId, title, content: "", location: "", people: [], objects: [], summary: "", order: 0, position: at, status: "active", wordCount: 0, lastEditedAt: stamp(), revision: 0 };
  const shifted = project.scenes.map((item) => item.chapterId === chapterId && item.position >= at ? { ...item, position: item.position + 1 } : item);
  const chapter = project.chapters.find((item) => item.id === chapterId);
  const chapters = project.chapters.map((item) => item.id === chapterId ? { ...item, sceneIds: [...item.sceneIds.slice(0, at), created.id, ...item.sceneIds.slice(at)], updatedAt: stamp() } : item);
  if (!chapter) throw new Error("Chapter not found");
  return { project: normalize({ ...project, scenes: [...shifted, created], chapters }), scene: created };
}

export function applyStructureCommand(project: StoryProject, command: StructureCommand): { project: StoryProject; selectedSceneId?: string } {
  let chapters = project.chapters.map((item) => ({ ...item }));
  let scenes = project.scenes.map((item) => ({ ...item }));
  const chapterIndex = chapters.findIndex((item) => item.id === command.id);
  const sceneIndex = scenes.findIndex((item) => item.id === command.id);
  if (command.type === "rename-chapter" && chapterIndex >= 0) chapters[chapterIndex].title = command.value?.trim() || "Untitled chapter";
  if ((command.type === "archive-chapter" || command.type === "restore-chapter") && chapterIndex >= 0) chapters[chapterIndex].status = command.type === "archive-chapter" ? "archived" : "active";
  if (command.type === "delete-chapter" && chapterIndex >= 0) { const chapterId = chapters[chapterIndex].id; chapters.splice(chapterIndex, 1); scenes = scenes.filter((item) => item.chapterId !== chapterId); }
  if (command.type === "move-chapter" && chapterIndex >= 0) { const delta = command.direction === "earlier" || command.direction === "before" ? -1 : 1; const target = Math.max(0, Math.min(chapters.length - 1, command.position ?? chapterIndex + delta)); const [chapter] = chapters.splice(chapterIndex, 1); chapters.splice(target, 0, chapter); }
  if (command.type === "duplicate-chapter" && chapterIndex >= 0) {
    const source = chapters[chapterIndex], chapterId = id("chapter"), createdAt = stamp();
    const copiedScenes = scenes.filter((item) => item.chapterId === source.id).map((item) => ({ ...item, id: id("scene"), chapterId, title: item.title, revision: 0, lastEditedAt: createdAt }));
    chapters.splice(chapterIndex + 1, 0, { ...source, id: chapterId, title: `${source.title} copy`, sceneIds: copiedScenes.map((item) => item.id), createdAt, updatedAt: createdAt }); scenes.push(...copiedScenes);
  }
  if (command.type === "rename-scene" && sceneIndex >= 0) scenes[sceneIndex].title = command.value?.trim() || "Untitled scene";
  if ((command.type === "archive-scene" || command.type === "restore-scene") && sceneIndex >= 0) scenes[sceneIndex].status = command.type === "archive-scene" ? "archived" : "active";
  if (command.type === "delete-scene" && sceneIndex >= 0) scenes.splice(sceneIndex, 1);
  if (command.type === "move-scene" && sceneIndex >= 0) {
    const scene = scenes[sceneIndex], targetChapterId = command.targetId || scene.chapterId;
    const siblings = scenes.filter((item) => item.chapterId === targetChapterId && item.id !== scene.id).sort((a, b) => a.position - b.position);
    const position = Math.max(0, Math.min(siblings.length, command.position ?? scene.position + (command.direction === "earlier" ? -1 : 1)));
    scenes[sceneIndex] = { ...scene, chapterId: targetChapterId, position };
  }
  if (command.type === "duplicate-scene" && sceneIndex >= 0) { const source = scenes[sceneIndex]; const copy = { ...source, id: id("scene"), title: `${source.title} copy`, position: source.position + 1, revision: 0, lastEditedAt: stamp() }; scenes.push(copy); return { project: normalize({ ...project, chapters, scenes }), selectedSceneId: copy.id }; }
  if (command.type === "split-scene" && sceneIndex >= 0) { const source = scenes[sceneIndex], at = Number(command.value ?? Math.floor(source.content.length / 2)); const splitAt = source.content.lastIndexOf(" ", at); const created = { ...source, id: id("scene"), title: `${source.title} — continued`, content: source.content.slice(splitAt).trim(), position: source.position + 1, revision: 0, lastEditedAt: stamp() }; scenes[sceneIndex] = { ...source, content: source.content.slice(0, splitAt).trim(), wordCount: source.content.slice(0, splitAt).trim().split(/\s+/).filter(Boolean).length }; scenes.push(created); return { project: normalize({ ...project, chapters, scenes }), selectedSceneId: created.id }; }
  chapters = chapters.map((chapter) => ({ ...chapter, sceneIds: scenes.filter((scene) => scene.chapterId === chapter.id).sort((a, b) => a.position - b.position).map((scene) => scene.id), updatedAt: stamp() }));
  return { project: normalize({ ...project, chapters, scenes }) };
}
