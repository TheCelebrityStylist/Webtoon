import { describe, expect, it } from "vitest";
import {
  FixtureStoryIntelligenceProvider,
  LocalMentionProvider,
  meaningfulBlocks,
  manuscriptHash,
  validatedResult,
  type StoryAnalysisInput,
} from "@/lib/canon/story-pulse";

const input = (text: string): StoryAnalysisInput => ({
  projectId: "project-1",
  sceneId: "scene-1",
  revision: 3,
  requestId: "request-123",
  manuscriptHash: manuscriptHash(text),
  blocks: [{ id: "block-1", text, adjacent: [], title: "Arrival", order: 0 }],
  candidateEntities: [],
  confirmedFacts: [],
});

describe("Story Pulse", () => {
  it("extracts the six exact-evidence proposals from the iconic demonstration", async () => {
    const request = input("Lena entered Rowan House carrying the silver key.");
    const result = validatedResult(request, await new FixtureStoryIntelligenceProvider().analyze(request));
    expect(result.proposals).toHaveLength(6);
    expect(result.proposals.map((proposal) => proposal.entityName)).toEqual([
      "Lena", "Rowan House", "silver key", "silver key", "Lena", "Lena enters Rowan House",
    ]);
    for (const proposal of result.proposals) {
      const block = request.blocks[0];
      expect(block.text.slice(proposal.evidence.startOffset, proposal.evidence.endOffset)).toBe(proposal.evidence.quote);
    }
  });

  it("reports the unsupported holder and the key's new location after the edit", async () => {
    const request = input("Lena threw the silver key into the river before entering Rowan House.");
    const result = validatedResult(request, await new FixtureStoryIntelligenceProvider().analyze(request));
    expect(result.proposals[0]).toMatchObject({ kind: "WARNING", property: "holder", beforeValue: "Lena", afterValue: null });
    expect(result.proposals[1]).toMatchObject({ kind: "TRANSITION", property: "location", afterValue: "river" });
  });

  it("analyzes only meaningful changed blocks", () => {
    expect(meaningfulBlocks([{ id: "a", text: "same words here" }], [{ id: "a", text: "same words here" }, { id: "b", text: "two words" }, { id: "c", text: "three changed words" }])).toEqual([{ id: "c", text: "three changed words" }]);
  });

  it("rejects mismatched evidence offsets", async () => {
    const request = input("Lena entered Rowan House carrying the silver key.");
    const result = await new FixtureStoryIntelligenceProvider().analyze(request);
    result.proposals[0].evidence.startOffset = 2;
    expect(validatedResult(request, result).proposals).toHaveLength(5);
  });

  it("links only known entity names and aliases without inferring state", async () => {
    const request = { ...input("Mara met Lena near Rowan House."), candidateEntities: [{ id: "lena", name: "Lena", aliases: ["Len"], type: "CHARACTER" as const }] };
    const result = await new LocalMentionProvider().analyze(request);
    expect(result.proposals).toHaveLength(1);
    expect(result.proposals[0]).toMatchObject({ kind: "MENTION", entityId: "lena", confidence: 1 });
    expect(result.warnings[0]).toContain("Deeper story analysis requires an AI provider");
  });
});
