import { describe, expect, it } from "vitest";
import { parseQuickCapture } from "@/lib/storyworld/quick-capture";

describe("quick capture", () => {
  it.each([
    ["The drowned library beneath the old house", "place"],
    ["At midnight, Tomas discovers the clocks are running backward", "event"],
    ["Who removed the childhood from the portrait?", "question"],
    ["The silver key belongs to Mara until Chapter 7", "object"],
    ["The Archivists Guild", "faction"],
  ])("classifies %s as %s without an AI provider", (input, kind) => {
    expect(parseQuickCapture(input).kind).toBe(kind);
  });

  it("removes an explicit record prefix from the proposed title", () => {
    expect(parseQuickCapture("New scene: The clockmaker's stair")).toEqual({ kind: "scene", title: "The clockmaker's stair", confidence: "deterministic" });
  });
});
