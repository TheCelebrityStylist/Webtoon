import { createHash } from "node:crypto";
import type { NarrativeEvidence } from "../domain/types";

export function quoteHash(quote: string) {
  return createHash("sha256").update(quote).digest("hex");
}

export function resolveEvidence(textByBlock: Record<string, string>, evidence: NarrativeEvidence): NarrativeEvidence {
  const block = textByBlock[evidence.blockId];
  if (!block) return { ...evidence, stale: true };
  const exact = block.slice(evidence.startOffset, evidence.endOffset);
  const valid = exact === evidence.exactQuote && quoteHash(exact) === evidence.quoteHash;
  return { ...evidence, stale: !valid };
}
