import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function loadEpisodeMarkdown(slug: string, ep: number): string | null {
  const full = path.join(process.cwd(), "content", "series", slug, `ep-${ep}.md`);
  if (!existsSync(full)) return null;
  return readFileSync(full, "utf8");
}

export function markdownToSafeText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}
