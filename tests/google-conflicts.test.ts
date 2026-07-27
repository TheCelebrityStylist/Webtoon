import { describe, expect, it } from "vitest";
import { assertGoogleConflictRevision, buildConflictGoogleRequests } from "@/lib/google/story-docs";

describe("Google conflict resolution", () => {
  const scenes = [{ id: "s1", title: "Opening", manuscriptText: "Morrow version" }];

  it("rejects stale conflict reviews", () => {
    expect(() => assertGoogleConflictRevision("revision-7", "revision-8")).toThrow(/changed after/i);
  });

  it("writes only explicitly Google-bound decisions", () => {
    expect(buildConflictGoogleRequests([{ sceneId: "s1", action: "USE_GOOGLE" }], scenes)).toEqual([]);
    expect(buildConflictGoogleRequests([{ sceneId: "s1", action: "SKIP" }], scenes)).toEqual([]);
    expect(buildConflictGoogleRequests([{ sceneId: "s1", action: "KEEP_MORROW" }], scenes)[0]).toEqual({
      replaceNamedRangeContent: { namedRangeName: "morrow:scene:s1", text: "Opening\nMorrow version\n\n" },
    });
  });

  it("persists the writer's merged text in the Google request", () => {
    const requests = buildConflictGoogleRequests([{ sceneId: "s1", action: "MERGE", mergedText: "Chosen merge" }], scenes);
    expect(requests[0]).toEqual({ replaceNamedRangeContent: { namedRangeName: "morrow:scene:s1", text: "Opening\nChosen merge\n\n" } });
  });
});
