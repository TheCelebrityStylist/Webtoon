import { z } from "zod";

export const perspectiveSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.enum(["REALITY", "NARRATOR", "READER"]) }),
  z.object({
    kind: z.enum(["CHARACTER_KNOWLEDGE", "CHARACTER_BELIEF", "CHARACTER_DECEPTION"]),
    perspectiveEntityId: z.string().min(1),
  }),
]);

export const evidenceSchema = z.object({
  id: z.string().min(1),
  sceneId: z.string().min(1),
  checkpointSequence: z.number().int().nonnegative(),
  blockId: z.string().min(1),
  startOffset: z.number().int().nonnegative(),
  endOffset: z.number().int().nonnegative(),
  exactQuote: z.string().min(1),
  quoteHash: z.string().min(16),
  sourceType: z.enum(["MANUSCRIPT", "MANUAL"]),
  sourceCommitId: z.string().min(1),
  relativePosition: z.string().optional(),
  stale: z.boolean().default(false),
}).refine((value) => value.endOffset > value.startOffset, "Evidence range must be non-empty");

export const coordinateSchema = z.object({
  manuscriptSequence: z.number().int().nonnegative(),
  storySequence: z.number().int().optional(),
  storyDate: z.string().datetime().optional(),
  approximateStoryDate: z.string().max(120).optional(),
  durationMinutes: z.number().nonnegative().optional(),
});

export const eventTypeSchema = z.enum([
  "ENTITY_INTRODUCED",
  "CHARACTER_ENTERS_LOCATION",
  "CHARACTER_LEAVES_LOCATION",
  "OBJECT_ACQUIRED",
  "OBJECT_TRANSFERRED",
  "OBJECT_DROPPED",
  "OBJECT_HIDDEN",
  "OBJECT_DESTROYED",
  "OBJECT_MOVED",
  "CHARACTER_LEARNS_FACT",
  "CHARACTER_BELIEVES_FACT",
  "CHARACTER_IS_DECEIVED",
  "READER_LEARNS_FACT",
  "QUESTION_INTRODUCED",
  "QUESTION_ESCALATED",
  "QUESTION_RESOLVED",
  "SETUP_CREATED",
  "PAYOFF_CREATED",
  "RELATIONSHIP_FACT_CONFIRMED",
  "CHARACTER_STATUS_CHANGED",
  "LOCATION_STATE_CHANGED",
]);

export const eventSchema = z.object({
  id: z.string().min(1),
  branchId: z.string().min(1),
  commitId: z.string().min(1),
  type: eventTypeSchema,
  subjectEntityId: z.string().min(1).optional(),
  objectEntityId: z.string().min(1).optional(),
  predicate: z.string().min(1).optional(),
  value: z.unknown().optional(),
  coordinate: coordinateSchema,
  perspective: perspectiveSchema,
  evidence: z.array(evidenceSchema).min(1),
  status: z.enum(["PROPOSED", "CONFIRMED", "INTENTIONAL_EXCEPTION", "SUPERSEDED", "RETRACTED"]),
});

export type NarrativePerspective = z.infer<typeof perspectiveSchema>;
export type NarrativeEvidence = z.infer<typeof evidenceSchema>;
export type NarrativeCoordinate = z.infer<typeof coordinateSchema>;
export type NarrativeEvent = z.infer<typeof eventSchema>;
export type NarrativeEventType = z.infer<typeof eventTypeSchema>;

export type EntityProjectionState = {
  entityId: string;
  introduced: boolean;
  locationId?: string;
  holderId?: string;
  ownerId?: string;
  condition?: string;
  status?: string;
  knowledge: Record<string, string[]>;
  beliefs: Record<string, string[]>;
  deceptions: Record<string, string[]>;
  relationships: Array<{ predicate: string; objectEntityId: string }>;
  questions: Record<string, "OPEN" | "ESCALATED" | "RESOLVED">;
  setups: Record<string, { payoffEventId?: string }>;
  readerKnowledge: string[];
  lastEventId?: string;
};

export type NarrativeProjection = {
  branchId: string;
  atManuscriptSequence: number;
  lastEventId?: string;
  entities: Record<string, EntityProjectionState>;
};

export type DiagnosticCode =
  | "OBJECT_UNAVAILABLE"
  | "IMPOSSIBLE_LOCATION"
  | "IMPOSSIBLE_KNOWLEDGE"
  | "DEAD_CHARACTER_ACTION"
  | "UNRESOLVED_SETUP"
  | "ORPHANED_PAYOFF"
  | "DUPLICATE_REVEAL"
  | "TIMELINE_ORDER_CONFLICT"
  | "STALE_EVIDENCE"
  | "BRANCH_DEPENDENCY_BREAK";

export type NarrativeDiagnostic = {
  id: string;
  code: DiagnosticCode;
  severity: "INFO" | "RISK" | "BLOCKER";
  title: string;
  explanation: string;
  sourceEntityId?: string;
  affectedEntityId?: string;
  sourceSceneId?: string;
  affectedSceneId?: string;
  evidence: NarrativeEvidence[];
  affectedEvidence: NarrativeEvidence[];
  dependencyPath: string[];
  suggestedReviewAction: string;
};

export type NarrativeDependency = {
  id: string;
  sourceEventId: string;
  targetEventId: string;
  type: "CAUSES" | "REQUIRES" | "REVEALS" | "SETS_UP" | "PAYS_OFF";
  evidenceIds: string[];
};
