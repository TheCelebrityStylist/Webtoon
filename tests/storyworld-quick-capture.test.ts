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
});
