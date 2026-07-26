import type { GoogleDocumentBlock, GoogleDocumentComparison, GoogleImportPreview, StoryProject } from "@/lib/story-canvas/types";
import { manuscriptFromText } from "@/lib/story-canvas/manuscript";
type RawBlock = { text: string; style?: string; kind?: "heading" | "paragraph" | "rule" };
const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
export type HeadingInterpretation = { heading1: "part" | "chapter"; heading2: "chapter" | "scene"; heading3: "scene"; splitRules: boolean };
export const defaultInterpretation: HeadingInterpretation = { heading1: "chapter", heading2: "scene", heading3: "scene", splitRules: true };

export function parseGoogleDocument(documentId: string, title: string, input: RawBlock[], interpretation = defaultInterpretation): GoogleImportPreview {
  const blocks: GoogleDocumentBlock[] = input.map((block, index) => ({ id: `block-${index}`, text: block.text.trim(), style: block.style ?? (block.kind === "heading" ? "HEADING_1" : "NORMAL_TEXT"), kind: block.kind ?? ((block.style ?? "").startsWith("HEADING") ? "heading" : block.text === "---" ? "rule" : "paragraph"), included: true })).filter((block) => block.text);
  const now = new Date().toISOString(); const projectId = `import-${key(title)}`; const parts: StoryProject["parts"] = []; const chapters: StoryProject["chapters"] = []; const scenes: StoryProject["scenes"] = [];
  let partId: string | undefined; let chapterId: string | undefined; let sceneTitle = "Opening"; let prose: string[] = [];
  const flush = () => { if (!chapterId || !prose.length) return; const position = scenes.filter((scene) => scene.chapterId === chapterId).length; const content = prose.join("\n\n"); const id = `${chapterId}-scene-${position + 1}`; scenes.push({ id, chapterId, title: sceneTitle || `Scene ${position + 1}`, manuscriptJson: manuscriptFromText(content, id), manuscriptText: content, content, location: "", people: [], objects: [], summary: "", order: scenes.length, position, status: "active", wordCount: content.split(/\s+/).filter(Boolean).length, lastEditedAt: now, revision: 0 }); const chapter = chapters.find((item) => item.id === chapterId); if (chapter) chapter.sceneIds.push(id); prose = []; };
  const chapter = (name: string) => { flush(); const position = chapters.length; chapterId = `${projectId}-chapter-${position + 1}`; chapters.push({ id: chapterId, projectId, partId, title: name || `Chapter ${position + 1}`, position, summary: "", status: "active", sceneIds: [], createdAt: now, updatedAt: now }); sceneTitle = "Opening"; };
  for (const block of blocks) { const level = Number(block.style.match(/HEADING_(\d)/)?.[1] ?? 0); if (block.kind === "heading" && level === 1 && interpretation.heading1 === "part") { flush(); partId = `${projectId}-part-${parts.length + 1}`; parts.push({ id: partId, projectId, title: block.text, position: parts.length, chapterIds: [], status: "active" }); chapterId = undefined; continue; } if (block.kind === "heading" && ((level === 1 && interpretation.heading1 === "chapter") || (level === 2 && interpretation.heading2 === "chapter"))) { chapter(block.text); if (partId) parts.find((item) => item.id === partId)?.chapterIds.push(chapterId!); continue; } if (block.kind === "heading" && ((level === 2 && interpretation.heading2 === "scene") || level === 3)) { if (!chapterId) chapter("Chapter 1"); flush(); sceneTitle = block.text; continue; } if (block.kind === "rule" && interpretation.splitRules) { if (!chapterId) chapter("Chapter 1"); flush(); sceneTitle = `Scene ${scenes.filter((scene) => scene.chapterId === chapterId).length + 1}`; continue; } if (!chapterId) chapter("Chapter 1"); prose.push(block.text); }
  flush(); for (const chapterRecord of chapters) if (!chapterRecord.sceneIds.length) { const id = `${chapterRecord.id}-scene-1`; const value = { id, chapterId: chapterRecord.id, title: "Untitled scene", manuscriptJson: manuscriptFromText("", id), manuscriptText: "", content: "", location: "", people: [], objects: [], summary: "", order: scenes.length, position: 0, status: "active" as const, wordCount: 0, lastEditedAt: now, revision: 0 }; scenes.push(value); chapterRecord.sceneIds.push(id); }
  return { documentId, title, blocks, project: { id: projectId, title, type: "NOVEL", premise: "", language: "en", parts, chapters, scenes, createdAt: now, updatedAt: now } };
}

export function namedRangeName(kind: "project" | "chapter" | "scene", id: string) { return `morrow:${kind}:${id}`; }
type NamedRangeRequest = { createNamedRange: { name: string; range: { startIndex: number; endIndex: number } } };
export type GoogleDocumentPlan = {
  text: string;
  ranges: Array<{ name: string; startIndex: number; endIndex: number }>;
  requests: Array<Record<string, unknown>>;
};

/** Builds text, styles, and ranges from one UTF-16 index cursor (the unit Google Docs uses). */
export function buildGoogleDocumentPlan(project: StoryProject): GoogleDocumentPlan {
  let text = "";
  const ranges: GoogleDocumentPlan["ranges"] = [];
  const styles: Array<{ startIndex: number; endIndex: number; namedStyleType: string }> = [];
  const append = (value: string) => {
    const startIndex = 1 + text.length;
    text += value;
    return { startIndex, endIndex: startIndex + value.length };
  };
  const title = append(`${project.title}\n`);
  styles.push({ ...title, endIndex: title.endIndex - 1, namedStyleType: "TITLE" });
  if (project.premise) append(`${project.premise}\n\n`);
  else append("\n");
  for (const chapter of project.chapters.filter((item) => item.status !== "archived").sort((a, b) => a.position - b.position)) {
    const chapterRange = append(`${chapter.title}\n`);
    ranges.push({ name: namedRangeName("chapter", chapter.id), startIndex: chapterRange.startIndex, endIndex: chapterRange.endIndex - 1 });
    styles.push({ ...chapterRange, endIndex: chapterRange.endIndex - 1, namedStyleType: "HEADING_1" });
    for (const scene of project.scenes.filter((item) => item.chapterId === chapter.id && item.status !== "archived").sort((a, b) => a.position - b.position)) {
      const sceneStart = 1 + text.length;
      const heading = append(`${scene.title}\n`);
      styles.push({ ...heading, endIndex: heading.endIndex - 1, namedStyleType: "HEADING_2" });
      append(scene.manuscriptText);
      if (!scene.manuscriptText.endsWith("\n")) append("\n");
      append("\n");
      ranges.push({ name: namedRangeName("scene", scene.id), startIndex: sceneStart, endIndex: 1 + text.length - 1 });
    }
  }
  ranges.unshift({ name: namedRangeName("project", project.id), startIndex: 1, endIndex: 1 + text.length });
  const requests: Array<Record<string, unknown>> = [
    { insertText: { location: { index: 1 }, text } },
    ...styles.map(({ namedStyleType, ...range }) => ({ updateParagraphStyle: { range, paragraphStyle: { namedStyleType }, fields: "namedStyleType" } })),
    ...ranges.map(({ name, startIndex, endIndex }) => ({ createNamedRange: { name, range: { startIndex, endIndex } } })),
  ];
  return { text, ranges, requests };
}

export function generateNamedRangeRequests(project: StoryProject): NamedRangeRequest[] {
  return buildGoogleDocumentPlan(project).ranges.map(({ name, startIndex, endIndex }) => ({ createNamedRange: { name, range: { startIndex, endIndex } } }));
}

type GoogleDocForScenes = {
  namedRanges?: Record<string, { namedRanges?: Array<{ ranges?: Array<{ startIndex?: number; endIndex?: number }> }> }>;
  body?: { content?: Array<{ startIndex?: number; endIndex?: number; paragraph?: { paragraphStyle?: { namedStyleType?: string }; elements?: Array<{ startIndex?: number; endIndex?: number; textRun?: { content?: string } }> } }> };
};

export function parseGoogleScenesByNamedRange(doc: GoogleDocForScenes) {
  const textAt = (startIndex: number, endIndex: number) => {
    let result = "";
    for (const block of doc.body?.content ?? []) {
      for (const element of block.paragraph?.elements ?? []) {
        const content = element.textRun?.content ?? "";
        const start = element.startIndex ?? block.startIndex ?? 1;
        const end = element.endIndex ?? start + content.length;
        const from = Math.max(startIndex, start);
        const to = Math.min(endIndex, end);
        if (to > from) result += content.slice(from - start, to - start);
      }
    }
    return result;
  };
  return Object.entries(doc.namedRanges ?? {}).flatMap(([name, group]) => {
    if (!name.startsWith("morrow:scene:")) return [];
    const range = group.namedRanges?.flatMap((item) => item.ranges ?? [])[0];
    if (range?.startIndex === undefined || range.endIndex === undefined) return [];
    const raw = textAt(range.startIndex, range.endIndex).replace(/\n+$/u, "");
    const [title = "Untitled scene", ...prose] = raw.split("\n");
    return [{ id: name.slice("morrow:scene:".length), title: title.trim() || "Untitled scene", content: prose.join("\n") }];
  });
}
export function compareGoogleDocument(input: { documentId: string; storedRevision?: string; googleRevision: string; storedLocalRevision?: number; localRevision: number; localScenes: Array<{ id: string; title: string; content: string }>; googleScenes: Array<{ id: string; title: string; content: string }> }): GoogleDocumentComparison { const googleChanged = Boolean(input.storedRevision && input.storedRevision !== input.googleRevision); const localChanged = input.localRevision !== (input.storedLocalRevision ?? input.localRevision); const status = googleChanged && localChanged ? "conflict" : googleChanged ? "google-only" : localChanged ? "morrow-only" : "unchanged"; const google = new Map(input.googleScenes.map((scene) => [scene.id, scene])); return { documentId: input.documentId, baseRevision: input.storedRevision, googleRevision: input.googleRevision, localRevision: input.localRevision, status, scenes: input.localScenes.filter((scene) => google.get(scene.id)?.content !== scene.content).map((scene) => ({ sceneId: scene.id, title: scene.title, morrow: scene.content, google: google.get(scene.id)?.content ?? "" })) }; }
export function buildMorrowToGoogleSyncPlan(project: StoryProject, changedSceneIds: string[], requiredRevisionId: string) { const changed = new Set(changedSceneIds); return { writeControl: { requiredRevisionId }, requests: project.scenes.filter((scene) => changed.has(scene.id)).map((scene) => ({ replaceNamedRangeContent: { namedRangeName: namedRangeName("scene", scene.id), text: `${scene.title}\n${scene.content}\n` } })) }; }
export function buildStoryWorkbook(project: StoryProject, entities: Array<{ id: string; name: string; type: string; appearances: string[]; [key: string]: unknown }>, continuity: Array<Record<string, unknown>> = []) { const chapters = project.chapters.filter((item) => item.status !== "archived"); const scenes = project.scenes.filter((item) => item.status !== "archived"); const sheets: Record<string, unknown[][]> = { Overview: [["Project", project.title], ["Type", project.type], ["Word count", scenes.reduce((sum, scene) => sum + scene.wordCount, 0)], ["Chapters", chapters.length], ["Scenes", scenes.length], ["Last synchronized", new Date().toISOString()]], Chapters: [["Chapter ID", "Position", "Part", "Title", "Summary", "Status", "Words"], ...chapters.map((chapter) => [chapter.id, chapter.position + 1, project.parts.find((part) => part.id === chapter.partId)?.title ?? "", chapter.title, chapter.summary, chapter.status, scenes.filter((scene) => scene.chapterId === chapter.id).reduce((sum, scene) => sum + scene.wordCount, 0)])], Scenes: [["Scene ID", "Chapter", "Position", "Title", "POV", "Place", "Summary", "Status", "Words"], ...scenes.map((scene) => [scene.id, chapters.find((chapter) => chapter.id === scene.chapterId)?.title ?? "", scene.position + 1, scene.title, scene.pointOfViewEntityId ?? "", scene.locationEntityId ?? scene.location, scene.summary, scene.status, scene.wordCount])], People: [], Places: [], Objects: [], Events: [], Questions: [], Continuity: [["Severity", "Issue", "Evidence", "Affected scene", "Status"], ...continuity.map((item) => [item.severity, item.issue, item.evidence, item.sceneId, item.status])] }; for (const name of ["People", "Places", "Objects", "Events", "Questions"]) sheets[name] = [["Entity ID", "Name", "Current state", "Appearances"], ...entities.filter((entity) => `${entity.type}s`.toLowerCase() === name.toLowerCase() || (name === "People" && entity.type === "person")).map((entity) => [entity.id, entity.name, entity.state ?? entity.currentLocation ?? "", entity.appearances.length])]; return sheets; }
