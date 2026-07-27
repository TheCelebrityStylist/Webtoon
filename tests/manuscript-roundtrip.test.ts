import { describe, expect, it } from "vitest";
import { manuscriptText, normalizeManuscript } from "@/lib/story-canvas/manuscript";
import { createCanvasState } from "@/lib/story-canvas/fixtures";
import { normalizeCanvasState } from "@/lib/story-canvas/persistence";
import { storyReducer } from "@/lib/story-canvas/story-reducer";
import type { ManuscriptDocument } from "@/lib/story-canvas/types";

const richDocument: ManuscriptDocument = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2, blockId: "heading-1" }, content: [{ type: "text", text: "The Crossing" }] },
    { type: "paragraph", attrs: { blockId: "paragraph-1" }, content: [
      { type: "text", text: "Lena spoke ", marks: [{ type: "italic" }] },
      { type: "text", text: "the truth", marks: [{ type: "bold" }] },
      { type: "text", text: "." },
    ] },
    { type: "bulletList", attrs: { blockId: "list-1" }, content: [
      { type: "listItem", attrs: { blockId: "item-1" }, content: [{ type: "paragraph", attrs: { blockId: "item-p-1" }, content: [{ type: "text", text: "Keep the key" }] }] },
      { type: "listItem", attrs: { blockId: "item-2" }, content: [{ type: "paragraph", attrs: { blockId: "item-p-2" }, content: [{ type: "text", text: "Open the door" }] }] },
    ] },
    { type: "blockquote", attrs: { blockId: "quote-1" }, content: [{ type: "paragraph", attrs: { blockId: "quote-p-1" }, content: [{ type: "text", text: "Every hour leaves a shadow." }] }] },
    { type: "horizontalRule", attrs: { blockId: "break-1" } },
  ],
};

describe("lossless manuscript round trip", () => {
  it("preserves rich nodes, marks, scene breaks, and stable block IDs through reducer and persistence", () => {
    const state = createCanvasState();
    const sceneId = state.currentSceneId;
    const text = manuscriptText(richDocument);
    const updated = storyReducer(state, { type: "UPDATE_SCENE", sceneId, manuscriptJson: richDocument, manuscriptText: text });
    const restored = normalizeCanvasState(JSON.parse(JSON.stringify(updated)));
    const scene = restored.scenes.find((item) => item.id === sceneId)!;
    expect(scene.manuscriptJson).toEqual(richDocument);
    expect(scene.manuscriptText).toBe(text);
    expect(scene.manuscriptJson.content?.[1].content?.[0].marks).toEqual([{ type: "italic" }]);
    expect(scene.manuscriptJson.content?.[4].type).toBe("horizontalRule");
  });

  it("migrates old plain-text demo scenes without losing paragraphs", () => {
    const state = createCanvasState();
    const legacy = structuredClone(state) as unknown as { version: 3; scenes: Array<Record<string, unknown>>; project: typeof state.project; entities: typeof state.entities };
    legacy.scenes[0] = { ...legacy.scenes[0], manuscriptJson: undefined, manuscriptText: undefined, content: "First paragraph.\n\nSecond paragraph." };
    const normalized = normalizeCanvasState(legacy as never);
    expect(normalized.scenes[0].manuscriptJson.content).toHaveLength(2);
    expect(normalized.scenes[0].manuscriptText).toBe("First paragraph.\n\nSecond paragraph.");
  });

  it("normalizes imported JSON while preserving existing block IDs", () => {
    expect(normalizeManuscript(richDocument).content?.[0].attrs?.blockId).toBe("heading-1");
  });
});
