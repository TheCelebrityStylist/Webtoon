import { describe, expect, it } from "vitest";
import { buildMorrowToGoogleSyncPlan, buildStoryWorkbook, generateNamedRangeRequests, parseGoogleDocument } from "@/lib/google/story-docs";
import { createCanvasState } from "@/lib/story-canvas/fixtures";
import { applyStructureCommand, createChapterRecord, createPartRecord, createSceneRecord } from "@/lib/story-canvas/structure";

describe("commercial writing workspace", () => {
  it("maintains Project → Part → Chapter → Scene relationships", () => {
    const initial = createCanvasState().project;
    const withPart = createPartRecord(initial, "Part Four");
    const withChapter = createChapterRecord(withPart.project, "The Crossing", withPart.part.id);
    const withScene = createSceneRecord(withChapter.project, withChapter.chapter.id, "At the quay");
    expect(withScene.project.parts.at(-1)?.chapterIds).toContain(withChapter.chapter.id);
    expect(withScene.project.chapters.find((chapter) => chapter.id === withChapter.chapter.id)?.sceneIds).toContain(withScene.scene.id);
  });

  it("duplicates, moves, archives, restores, and deletes scenes without losing source prose", () => {
    const initial = createCanvasState().project;
    const source = initial.scenes[0];
    const duplicated = applyStructureCommand(initial, { projectId: initial.id, type: "duplicate-scene", id: source.id });
    const copy = duplicated.project.scenes.find((scene) => scene.id === duplicated.selectedSceneId)!;
    expect(copy.content).toBe(source.content);
    const moved = applyStructureCommand(duplicated.project, { projectId: initial.id, type: "move-scene", id: copy.id, targetId: initial.chapters[1].id, position: 0 });
    expect(moved.project.scenes.find((scene) => scene.id === copy.id)?.chapterId).toBe(initial.chapters[1].id);
    const archived = applyStructureCommand(moved.project, { projectId: initial.id, type: "archive-scene", id: copy.id });
    expect(archived.project.scenes.find((scene) => scene.id === copy.id)?.status).toBe("archived");
    const restored = applyStructureCommand(archived.project, { projectId: initial.id, type: "restore-scene", id: copy.id });
    const deleted = applyStructureCommand(restored.project, { projectId: initial.id, type: "delete-scene", id: copy.id });
    expect(deleted.project.scenes.some((scene) => scene.id === copy.id)).toBe(false);
  });

  it("previews a Google Doc hierarchy before import", () => {
    const preview = parseGoogleDocument("document-12345", "Salt House", [
      { text: "Book One", style: "HEADING_1", kind: "heading" },
      { text: "Arrival", style: "HEADING_2", kind: "heading" },
      { text: "Mara reaches the harbor.", kind: "paragraph" },
    ], { heading1: "part", heading2: "chapter", heading3: "scene", splitRules: true });
    expect(preview.project.parts[0].title).toBe("Book One");
    expect(preview.project.chapters[0].title).toBe("Arrival");
    expect(preview.project.scenes[0].content).toContain("harbor");
  });

  it("creates stable named ranges, revision-guarded sync, and a complete Story Workbook", () => {
    const state = createCanvasState();
    const requests = generateNamedRangeRequests(state.project);
    expect(requests.some((request) => request.createNamedRange.name === `morrow:scene:${state.scenes[0].id}`)).toBe(true);
    const plan = buildMorrowToGoogleSyncPlan(state.project, [state.scenes[0].id], "revision-7");
    expect(plan.writeControl.requiredRevisionId).toBe("revision-7");
    expect(plan.requests).toHaveLength(1);
    expect(Object.keys(buildStoryWorkbook(state.project, state.entities))).toEqual(["Overview", "Chapters", "Scenes", "People", "Places", "Objects", "Events", "Questions", "Continuity"]);
  });
});
