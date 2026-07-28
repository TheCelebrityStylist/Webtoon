import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";

describe("production Storyworld modules", () => {
  it("contain no fixture-specific narrative conditions", () => {
    const result = spawnSync("rg", [
      "-n",
      "silver-key|portrait-gallery|archive-door|chapter-1|Rowan House|The Museum of Lost Hours|Lena",
      "components/story-canvas",
      "lib/story-canvas",
      "lib/storyworld",
      "app/api/projects",
      "--glob", "*.{ts,tsx}",
      "--glob", "!fixtures.ts",
    ], { encoding: "utf8" });
    expect(result.stdout.trim()).toBe("");
  });
});
