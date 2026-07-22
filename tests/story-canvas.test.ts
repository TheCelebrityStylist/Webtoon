import { describe, expect, it } from "vitest";
import { createCanvasState } from "@/lib/story-canvas/fixtures";
import { calculateImpact } from "@/lib/story-canvas/impact-engine";
import { changedParagraphs, LocalDemoStoryAnalyzer } from "@/lib/story-canvas/local-analyzer";
import { readCanvasState, STORY_CANVAS_KEY, writeCanvasState } from "@/lib/story-canvas/persistence";
import { storyReducer } from "@/lib/story-canvas/story-reducer";

const sentence = "Lena entered Rowan House carrying the silver key.";

describe("Morrow Story Canvas", () => {
  it("matches seeded entities by name and alias", () => {
    const state = createCanvasState();
    const proposals = new LocalDemoStoryAnalyzer().analyze({ scene: state.scenes[3], paragraphId: "p1", text: sentence, entities: state.entities });
    expect(proposals.filter((proposal) => proposal.predicate === "exists").map((proposal) => proposal.subjectId)).toEqual(["lena", "rowan-house", "silver-key"]);
  });

  it("extracts an explicit holder state without speculation", () => {
    const state = createCanvasState();
    const proposals = new LocalDemoStoryAnalyzer().analyze({ scene: state.scenes[3], paragraphId: "p1", text: sentence, entities: state.entities });
    expect(proposals).toHaveLength(4);
    expect(proposals[3]).toMatchObject({ subjectId: "silver-key", predicate: "holder", value: "Lena Ortiz" });
  });

  it("preserves exact evidence ranges", () => {
    const state = createCanvasState();
    const proposals = new LocalDemoStoryAnalyzer().analyze({ scene: state.scenes[3], paragraphId: "p1", text: sentence, entities: state.entities });
    for (const proposal of proposals) expect(sentence.slice(proposal.start, proposal.end)).toBe(proposal.quote);
  });

  it("returns only meaningful changed paragraphs", () => {
    expect(changedParagraphs("One stable paragraph.\n\nTwo old words.", "One stable paragraph.\n\nThree entirely new words.")).toEqual([{ id: "paragraph-1", text: "Three entirely new words." }]);
  });

  it("confirms observations into shared object state", () => {
    const state = createCanvasState();
    const proposal = new LocalDemoStoryAnalyzer().analyze({ scene: state.scenes[3], paragraphId: "p1", text: sentence, entities: state.entities }).find((item) => item.predicate === "holder")!;
    const proposed = storyReducer(state, { type: "SET_PROPOSALS", proposals: [proposal] });
    const confirmed = storyReducer(proposed, { type: "CONFIRM_PROPOSALS", ids: [proposal.id] });
    expect(confirmed.entities.find((entity) => entity.id === "silver-key")?.currentHolder).toBe("Lena Ortiz");
  });

  it("calculates the archive-door impact after the key enters the river", () => {
    const state = createCanvasState();
    state.observations.push({ id: "held", subjectId: "silver-key", predicate: "holder", value: "Lena Ortiz", sceneId: "conversation-room", paragraphId: "p1", quote: "carrying the silver key", start: 0, end: 23, status: "confirmed", kind: "state", title: "Lena carries the silver key" });
    const changed = new LocalDemoStoryAnalyzer().analyze({ scene: state.scenes[3], paragraphId: "p1", text: "Lena threw the silver key into the river before entering Rowan House.", entities: state.entities }).find((item) => item.predicate === "location")!;
    const impact = calculateImpact(state, changed);
    expect(impact?.affectedScenes.map((scene) => scene.id)).toContain("archive-door");
  });

  it("restores a previous reducer state as undo", () => {
    const state = createCanvasState();
    const changed = storyReducer(state, { type: "CREATE_SCENE", title: "New scene" });
    expect(storyReducer(changed, { type: "RESTORE", state }).scenes).toHaveLength(9);
  });

  it("persists versioned state and falls back from invalid storage", () => {
    let raw = "";
    writeCanvasState({ setItem: (key, value) => { expect(key).toBe(STORY_CANVAS_KEY); raw = value; } }, createCanvasState());
    expect(readCanvasState({ getItem: () => raw }).version).toBe(2);
    expect(readCanvasState({ getItem: () => "not-json" }).scenes).toHaveLength(9);
  });
});
