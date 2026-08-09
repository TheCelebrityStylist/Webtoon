import type { EntityType } from "@/lib/story-canvas/types";

export type QuickCaptureKind = EntityType | "chapter" | "scene" | "part";
export type QuickCaptureProposal = { kind: QuickCaptureKind; title: string; confidence: "deterministic" };

export function parseQuickCapture(input: string): QuickCaptureProposal {
  const value = input.trim();
  const lower = value.toLowerCase();
  let kind: QuickCaptureKind = "person";
  if (/^(who|what|why|how|where|when)\b/.test(lower) || value.endsWith("?")) kind = "question";
  else if (/\b(key|diary|letter|ring|sword|book|object|belongs to|held by)\b/.test(lower)) kind = "object";
  else if (/^(?:new\s+)?chapter\b/.test(lower)) kind = "chapter";
  else if (/\b(scene)\b/.test(lower)) kind = "scene";
  else if (/\b(at|during|midnight|morning|evening|discovers?|arrives?|leaves?|dies?|finds?)\b/.test(lower)) kind = "event";
  else if (/\b(house|room|library|city|river|street|museum|forest|island|station)\b/.test(lower)) kind = "place";
  else if (/\b(faction|guild|order|team|family|company|society)\b/.test(lower)) kind = "faction";
  const title = (value.replace(/^(?:new\s+)?(?:chapter|scene|part|person|place|object|event|question|faction)\s*:\s*/i, "").split(/[,.]/)[0]?.trim()) || "Untitled";
  return { kind, title, confidence: "deterministic" };
}
