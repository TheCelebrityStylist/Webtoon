import { describe, expect, it } from "vitest";
import { buildScopedStoryPulsePayload } from "@/lib/story-canvas/data-source";
import { createCanvasState } from "@/lib/story-canvas/fixtures";

describe("scoped Story Pulse payload", () => {
  it("does not serialize a 150-chapter, 1,500-scene, 2,000-entity workspace for one changed paragraph", () => {
    const state = createCanvasState();
    state.project.chapters = Array.from({ length: 150 }, (_, index) => ({ ...state.project.chapters[0], id: `chapter-${index}`, title: `Chapter ${index}`, position: index }));
    state.scenes = Array.from({ length: 1_500 }, (_, index) => ({ ...state.scenes[0], id: `scene-${index}`, chapterId: `chapter-${Math.floor(index / 10)}`, manuscriptText: `Unrelated prose ${index}`, content: `Unrelated prose ${index}` }));
    state.project.scenes = state.scenes;
    state.entities = Array.from({ length: 2_000 }, (_, index) => ({ ...state.entities[0], id: `entity-${index}`, name: index === 1777 ? "Mara Voss" : `Person ${index}`, aliases: [], appearances: [] }));
    const payload = buildScopedStoryPulsePayload(state, { projectId: state.project.id, sceneId: "scene-0", revision: 3, blocks: [{ id: "block-a", text: "Mara Voss opens the sealed door." }] }, "hash", "request");
    const json = JSON.stringify(payload);
    expect(payload.candidateEntities).toHaveLength(1);
    expect(payload.candidateEntities[0].name).toBe("Mara Voss");
    expect(json).not.toContain("chapters");
    expect(json).not.toContain("scenes");
    expect(json.length).toBeLessThan(5_000);
  });
});
