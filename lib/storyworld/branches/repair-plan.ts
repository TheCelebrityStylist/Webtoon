import type { NarrativeDiagnostic } from "../domain/types";

export type RepairTask = {
  id: string;
  affectedSceneId?: string;
  reason: string;
  dependencyPath: string[];
  evidenceQuote?: string;
  actionType: "KEEP" | "REVISE" | "REMOVE" | "ADD_TRANSITION" | "ADD_REVELATION" | "CHANGE_OBJECT_PATH" | "MARK_INTENTIONAL" | "RESOLVE_QUESTION";
  selected: boolean;
};

const actionByCode: Record<NarrativeDiagnostic["code"], RepairTask["actionType"]> = {
  OBJECT_UNAVAILABLE: "CHANGE_OBJECT_PATH",
  IMPOSSIBLE_LOCATION: "ADD_TRANSITION",
  IMPOSSIBLE_KNOWLEDGE: "ADD_REVELATION",
  DEAD_CHARACTER_ACTION: "REVISE",
  UNRESOLVED_SETUP: "RESOLVE_QUESTION",
  ORPHANED_PAYOFF: "REVISE",
  DUPLICATE_REVEAL: "KEEP",
  TIMELINE_ORDER_CONFLICT: "REVISE",
  STALE_EVIDENCE: "REVISE",
  BRANCH_DEPENDENCY_BREAK: "REVISE",
};

export function buildRepairPlan(diagnostics: NarrativeDiagnostic[]): RepairTask[] {
  return diagnostics.map((diagnostic) => ({
    id: `repair:${diagnostic.id}`,
    affectedSceneId: diagnostic.affectedSceneId,
    reason: diagnostic.explanation,
    dependencyPath: diagnostic.dependencyPath,
    evidenceQuote: diagnostic.affectedEvidence[0]?.exactQuote,
    actionType: actionByCode[diagnostic.code],
    selected: false,
  }));
}
