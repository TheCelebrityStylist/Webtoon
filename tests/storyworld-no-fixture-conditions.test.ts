import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const roots = ["components/story-canvas", "lib/story-canvas", "lib/storyworld", "app/api/projects"];
const forbidden = /silver-key|portrait-gallery|archive-door|chapter-1|Rowan House|The Museum of Lost Hours|Lena/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) && entry.name !== "fixtures.ts" ? [path] : [];
  });
}

describe("production Storyworld modules", () => {
  it("contain no fixture-specific narrative conditions", () => {
    const violations = roots.flatMap(sourceFiles).filter((path) => forbidden.test(readFileSync(path, "utf8")));
    expect(violations).toEqual([]);
  });
});
