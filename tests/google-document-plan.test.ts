import { describe, expect, it } from "vitest";
import { buildGoogleDocumentPlan, parseGoogleScenesByNamedRange } from "@/lib/google/story-docs";
import { createCanvasState } from "@/lib/story-canvas/fixtures";

describe("Google document plan", () => {
  it.each([
    ["empty premise", "", "Plain scene"],
    ["emoji and accents", "Mémoire 🧭", "Zoë crossed the café 🌊"],
    ["empty scene", "A premise", ""],
    ["multiline scene", "A premise", "one\n\ntwo\nthree"],
  ])("uses one exact UTF-16 cursor for %s", (_, premise, prose) => {
    const project = structuredClone(createCanvasState().project);
    project.title = "Morrow ✨";
    project.premise = premise;
    project.chapters = [project.chapters[0]];
    project.scenes = [{ ...project.scenes[0], chapterId: project.chapters[0].id, manuscriptText: prose, content: prose }];
    const plan = buildGoogleDocumentPlan(project);
    const inserted = (plan.requests[0] as { insertText: { text: string } }).insertText.text;
    expect(inserted).toBe(plan.text);
    for (const range of plan.ranges) {
      expect(range.startIndex).toBeGreaterThanOrEqual(1);
      expect(range.endIndex).toBeLessThanOrEqual(plan.text.length + 1);
      expect(range.endIndex).toBeGreaterThan(range.startIndex);
    }
    const sceneRange = plan.ranges.find((range) => range.name.startsWith("morrow:scene:"))!;
    expect(plan.text.slice(sceneRange.startIndex - 1, sceneRange.endIndex - 1)).toContain(project.scenes[0].title);
  });

  it("remains exact for more than 100 scenes", () => {
    const project = structuredClone(createCanvasState().project);
    const chapter = project.chapters[0];
    project.chapters = [chapter];
    project.scenes = Array.from({ length: 125 }, (_, index) => ({
      ...project.scenes[0],
      id: `scene-${index}`,
      chapterId: chapter.id,
      title: `Scene ${index} 🧭`,
      manuscriptText: `Line ${index}\nZoë café`,
      content: `Line ${index}\nZoë café`,
      position: index,
    }));
    const plan = buildGoogleDocumentPlan(project);
    expect(plan.ranges.filter((range) => range.name.startsWith("morrow:scene:"))).toHaveLength(125);
    expect(plan.ranges.every((range, index) => index === 0 || range.startIndex >= 1 && range.endIndex <= plan.text.length + 1)).toBe(true);
  });

  it("parses only mapped scenes and never assigns the whole Doc to a missing range", () => {
    const content = "Scene One\nFirst body\nUnmapped appendix\n";
    const scenes = parseGoogleScenesByNamedRange({
      body: { content: [{ startIndex: 1, endIndex: 1 + content.length, paragraph: { elements: [{ startIndex: 1, endIndex: 1 + content.length, textRun: { content } }] } }] },
      namedRanges: {
        "morrow:scene:s1": { namedRanges: [{ ranges: [{ startIndex: 1, endIndex: 22 }] }] },
        "unrelated": { namedRanges: [{ ranges: [{ startIndex: 22, endIndex: 40 }] }] },
      },
    });
    expect(scenes).toEqual([{ id: "s1", title: "Scene One", content: "First body" }]);
  });
});
