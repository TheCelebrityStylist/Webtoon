import { describe, expect, it } from "vitest";
import { toCanonEntityType } from "@/lib/story-canvas/entity-types";
import type { EntityType } from "@/lib/story-canvas/types";

describe("planning entity types", () => {
  it("never aliases factions or questions to events", () => {
    expect(toCanonEntityType("faction")).toBe("FACTION");
    expect(toCanonEntityType("question")).toBe("QUESTION");
    expect(toCanonEntityType("faction")).not.toBe("EVENT");
    expect(toCanonEntityType("question")).not.toBe("EVENT");
  });

  it("preserves every canonical domain type", () => {
    const types: EntityType[] = ["person", "place", "object", "event", "faction", "question"];
    expect(types.map(toCanonEntityType)).toEqual([
      "CHARACTER", "PLACE", "OBJECT", "EVENT", "FACTION", "QUESTION",
    ]);
  });
});
