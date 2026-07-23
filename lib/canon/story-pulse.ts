import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";

export const storyBlockSchema = z.object({
  id: z.string().min(1),
  text: z.string().max(20_000),
  adjacent: z.array(z.string().max(20_000)).max(2).default([]),
  title: z.string().max(240).optional(),
  order: z.number().int().nonnegative(),
});

export const storyEvidenceSchema = z.object({
  blockId: z.string().min(1),
  quote: z.string().min(1),
  startOffset: z.number().int().nonnegative(),
  endOffset: z.number().int().positive(),
});

export const storyProposalSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["ENTITY", "TRANSITION", "EVENT", "MENTION", "WARNING"]),
  entityType: z.enum(["CHARACTER", "PLACE", "OBJECT", "EVENT"]).optional(),
  entityName: z.string().min(1).max(240).optional(),
  entityId: z.string().optional(),
  property: z.string().max(120).optional(),
  beforeValue: z.unknown().optional(),
  afterValue: z.unknown().optional(),
  evidence: storyEvidenceSchema,
  confidence: z.number().min(0).max(1),
  perspective: z.enum(["OBJECTIVE", "CHARACTER", "NARRATOR"]).default("OBJECTIVE"),
});

export const storyAnalysisInputSchema = z.object({
  projectId: z.string().min(1),
  sceneId: z.string().min(1),
  revision: z.number().int().nonnegative(),
  requestId: z.string().min(8),
  manuscriptHash: z.string().length(64),
  blocks: z.array(storyBlockSchema).min(1).max(12),
  candidateEntities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    aliases: z.array(z.string()).default([]),
    type: z.enum(["CHARACTER", "PLACE", "OBJECT", "EVENT"]),
  })).max(100),
  confirmedFacts: z.array(z.object({
    id: z.string(),
    entityId: z.string().optional(),
    predicate: z.string(),
    value: z.unknown(),
  })).max(200),
});

export const storyAnalysisResultSchema = z.object({
  requestId: z.string(),
  revision: z.number().int().nonnegative(),
  manuscriptHash: z.string().length(64),
  provider: z.enum(["openai", "fixture", "local-mention"]),
  proposals: z.array(storyProposalSchema).max(50),
  warnings: z.array(z.string().max(500)).max(20).default([]),
});

export type StoryAnalysisInput = z.infer<typeof storyAnalysisInputSchema>;
export type StoryAnalysisResult = z.infer<typeof storyAnalysisResultSchema>;
export type StoryProposal = z.infer<typeof storyProposalSchema>;

export interface StoryIntelligenceProvider {
  analyze(input: StoryAnalysisInput): Promise<StoryAnalysisResult>;
}

export const manuscriptHash = (text: string) =>
  createHash("sha256").update(text).digest("hex");

export function meaningfulBlocks(
  previous: Array<{ id: string; text: string }>,
  current: Array<{ id: string; text: string }>,
) {
  const old = new Map(previous.map((block) => [block.id, block.text]));
  return current.filter((block) => {
    const normalized = block.text.replace(/\s+/g, " ").trim();
    return normalized.split(" ").filter(Boolean).length >= 3 && old.get(block.id)?.replace(/\s+/g, " ").trim() !== normalized;
  });
}

export function validateEvidence(input: StoryAnalysisInput, proposal: StoryProposal) {
  const block = input.blocks.find((candidate) => candidate.id === proposal.evidence.blockId);
  if (!block) return false;
  const { startOffset, endOffset, quote } = proposal.evidence;
  return endOffset > startOffset && block.text.slice(startOffset, endOffset) === quote;
}

export function validatedResult(input: StoryAnalysisInput, result: unknown) {
  const parsed = storyAnalysisResultSchema.parse(result);
  if (parsed.requestId !== input.requestId || parsed.revision !== input.revision || parsed.manuscriptHash !== input.manuscriptHash) {
    throw new Error("Story analysis returned stale manuscript metadata");
  }
  return { ...parsed, proposals: parsed.proposals.filter((proposal) => proposal.confidence >= 0.78 && validateEvidence(input, proposal)) };
}

const evidence = (block: StoryAnalysisInput["blocks"][number], quote: string) => {
  const startOffset = block.text.indexOf(quote);
  return { blockId: block.id, quote, startOffset, endOffset: startOffset + quote.length };
};

export class FixtureStoryIntelligenceProvider implements StoryIntelligenceProvider {
  async analyze(input: StoryAnalysisInput): Promise<StoryAnalysisResult> {
    const block = input.blocks[0];
    const first = "Lena entered Rowan House carrying the silver key.";
    const changed = "Lena threw the silver key into the river before entering Rowan House.";
    const proposals: StoryProposal[] = [];
    if (block.text.includes(first)) {
      proposals.push(
        { id: randomUUID(), kind: "ENTITY", entityType: "CHARACTER", entityName: "Lena", evidence: evidence(block, "Lena"), confidence: 0.99, perspective: "OBJECTIVE" },
        { id: randomUUID(), kind: "ENTITY", entityType: "PLACE", entityName: "Rowan House", evidence: evidence(block, "Rowan House"), confidence: 0.99, perspective: "OBJECTIVE" },
        { id: randomUUID(), kind: "ENTITY", entityType: "OBJECT", entityName: "silver key", evidence: evidence(block, "silver key"), confidence: 0.99, perspective: "OBJECTIVE" },
        { id: randomUUID(), kind: "TRANSITION", entityType: "OBJECT", entityName: "silver key", property: "holder", afterValue: "Lena", evidence: evidence(block, "carrying the silver key"), confidence: 0.98, perspective: "OBJECTIVE" },
        { id: randomUUID(), kind: "TRANSITION", entityType: "CHARACTER", entityName: "Lena", property: "location", afterValue: "Rowan House", evidence: evidence(block, "entered Rowan House"), confidence: 0.98, perspective: "OBJECTIVE" },
        { id: randomUUID(), kind: "EVENT", entityType: "EVENT", entityName: "Lena enters Rowan House", property: "occurs", afterValue: true, evidence: evidence(block, first), confidence: 0.98, perspective: "OBJECTIVE" },
      );
    } else if (block.text.includes(changed)) {
      proposals.push(
        { id: randomUUID(), kind: "WARNING", entityType: "OBJECT", entityName: "silver key", property: "holder", beforeValue: "Lena", afterValue: null, evidence: evidence(block, "threw the silver key into the river"), confidence: 0.99, perspective: "OBJECTIVE" },
        { id: randomUUID(), kind: "TRANSITION", entityType: "OBJECT", entityName: "silver key", property: "location", afterValue: "river", evidence: evidence(block, "silver key into the river"), confidence: 0.99, perspective: "OBJECTIVE" },
        { id: randomUUID(), kind: "TRANSITION", entityType: "CHARACTER", entityName: "Lena", property: "location", afterValue: "Rowan House", evidence: evidence(block, "entering Rowan House"), confidence: 0.98, perspective: "OBJECTIVE" },
      );
    }
    return { requestId: input.requestId, revision: input.revision, manuscriptHash: input.manuscriptHash, provider: "fixture", proposals, warnings: [] };
  }
}

export class LocalMentionProvider implements StoryIntelligenceProvider {
  async analyze(input: StoryAnalysisInput): Promise<StoryAnalysisResult> {
    const proposals: StoryProposal[] = [];
    for (const block of input.blocks) {
      for (const entity of input.candidateEntities) {
        for (const name of [entity.name, ...entity.aliases].filter(Boolean)) {
          const match = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "i").exec(block.text);
          if (!match) continue;
          proposals.push({ id: randomUUID(), kind: "MENTION", entityId: entity.id, entityType: entity.type, entityName: entity.name, evidence: { blockId: block.id, quote: match[0], startOffset: match.index, endOffset: match.index + match[0].length }, confidence: 1, perspective: "OBJECTIVE" });
          break;
        }
      }
    }
    return { requestId: input.requestId, revision: input.revision, manuscriptHash: input.manuscriptHash, provider: "local-mention", proposals, warnings: ["Entity linking is available. Deeper story analysis requires an AI provider."] };
  }
}
