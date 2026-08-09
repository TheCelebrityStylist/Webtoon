import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { eventSchema, type NarrativeEvent } from "@/lib/storyworld/domain/types";
import { quoteHash, resolveEvidence } from "@/lib/storyworld/compiler/evidence-resolver";
import { replayIncrementally, replayProjection } from "@/lib/storyworld/compiler/projection-builder";
import { diagnoseStoryworld } from "@/lib/storyworld/compiler/diagnostic-engine";

const event = (overrides: Partial<NarrativeEvent> = {}): NarrativeEvent => eventSchema.parse({
  id: "event-1",
  branchId: "main",
  commitId: "commit-1",
  type: "OBJECT_ACQUIRED",
  subjectEntityId: "object-1",
  objectEntityId: "person-1",
  coordinate: { manuscriptSequence: 1 },
  perspective: { kind: "REALITY" },
  evidence: [{ id: "evidence-1", sceneId: "scene-1", checkpointSequence: 1, blockId: "block-1", startOffset: 0, endOffset: 3, exactQuote: "key", quoteHash: quoteHash("key"), sourceType: "MANUSCRIPT", sourceCommitId: "commit-1", stale: false }],
  status: "CONFIRMED",
  ...overrides,
});

describe("narrative compiler", () => {
  it("separates character knowledge from reality", () => {
    const learned = event({ id: "learned", type: "CHARACTER_LEARNS_FACT", subjectEntityId: "fact-1", value: "door-code", perspective: { kind: "CHARACTER_KNOWLEDGE", perspectiveEntityId: "person-1" } });
    const projection = replayProjection("main", [learned]);
    expect(projection.entities["person-1"].knowledge["door-code"]).toEqual(["learned"]);
    expect(projection.entities["fact-1"]?.knowledge["door-code"]).toBeUndefined();
  });

  it("marks exact evidence stale instead of moving it", () => {
    const evidence = event().evidence[0];
    expect(resolveEvidence({ "block-1": "key remains" }, evidence).stale).toBe(false);
    expect(resolveEvidence({ "block-1": "map remains" }, evidence).stale).toBe(true);
  });

  it("reports a branch dependency break with an explicit path", () => {
    const target = event({ id: "target", coordinate: { manuscriptSequence: 2 } });
    const diagnostics = diagnoseStoryworld(replayProjection("branch", [target]), [target], [{ id: "dependency", sourceEventId: "missing", targetEventId: "target", type: "REQUIRES", evidenceIds: ["evidence-1"] }]);
    expect(diagnostics[0]).toMatchObject({ code: "BRANCH_DEPENDENCY_BREAK", severity: "BLOCKER", dependencyPath: ["missing", "target"] });
  });

  it("keeps complete and incremental replay equivalent for random event sequences", () => {
    fc.assert(fc.property(fc.array(fc.record({
      sequence: fc.integer({ min: 1, max: 500 }),
      holder: fc.constantFrom("person-a", "person-b", "person-c"),
      object: fc.constantFrom("object-a", "object-b"),
    }), { maxLength: 100 }), (records) => {
      const events = records
        .sort((a, b) => a.sequence - b.sequence)
        .map((record, index) => event({ id: `event-${index}`, subjectEntityId: record.object, objectEntityId: record.holder, coordinate: { manuscriptSequence: record.sequence } }));
      const midpoint = Math.floor(events.length / 2);
      const base = replayProjection("main", events.slice(0, midpoint));
      expect(replayIncrementally(base, events.slice(midpoint))).toEqual(replayProjection("main", events));
    }), { numRuns: 100 });
  });
});
