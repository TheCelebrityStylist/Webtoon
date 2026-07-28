import type { NarrativeDependency, NarrativeDiagnostic, NarrativeEvent, NarrativeProjection } from "../domain/types";

const firstEvidence = (event: NarrativeEvent) => event.evidence.slice(0, 1);

function diagnostic(
  code: NarrativeDiagnostic["code"],
  severity: NarrativeDiagnostic["severity"],
  event: NarrativeEvent,
  title: string,
  explanation: string,
  action: string,
  dependencyPath: string[] = [event.id],
): NarrativeDiagnostic {
  return {
    id: `${code}:${event.id}`,
    code,
    severity,
    title,
    explanation,
    sourceEntityId: event.subjectEntityId,
    affectedEntityId: event.objectEntityId,
    sourceSceneId: event.evidence[0]?.sceneId,
    affectedSceneId: event.evidence[0]?.sceneId,
    evidence: firstEvidence(event),
    affectedEvidence: firstEvidence(event),
    dependencyPath,
    suggestedReviewAction: action,
  };
}

export function diagnoseStoryworld(
  projection: NarrativeProjection,
  events: NarrativeEvent[],
  dependencies: NarrativeDependency[] = [],
): NarrativeDiagnostic[] {
  const diagnostics: NarrativeDiagnostic[] = [];
  const ordered = [...events].sort((a, b) => a.coordinate.manuscriptSequence - b.coordinate.manuscriptSequence);
  const readerReveals = new Map<string, NarrativeEvent>();
  const setups = new Map<string, NarrativeEvent>();
  const paidSetups = new Set<string>();

  for (const event of ordered) {
    if (event.evidence.some((evidence) => evidence.stale)) {
      diagnostics.push(diagnostic("STALE_EVIDENCE", "BLOCKER", event, "Source evidence changed", "The confirmed quotation no longer exists at its anchored range.", "Review and reconfirm the source evidence."));
    }
    if (event.type === "OBJECT_ACQUIRED" || event.type === "OBJECT_TRANSFERRED") {
      const object = event.subjectEntityId ? projection.entities[event.subjectEntityId] : undefined;
      if (object?.condition === "DESTROYED") {
        diagnostics.push(diagnostic("OBJECT_UNAVAILABLE", "BLOCKER", event, "Object is unavailable", "This action requires an object that was previously destroyed.", "Restore a supported object path or revise the action."));
      }
    }
    if (event.type === "CHARACTER_LEARNS_FACT" && event.perspective.kind === "CHARACTER_KNOWLEDGE") {
      const knowledge = projection.entities[event.perspective.perspectiveEntityId]?.knowledge ?? {};
      if (!knowledge[String(event.value ?? event.predicate ?? "")]) {
        diagnostics.push(diagnostic("IMPOSSIBLE_KNOWLEDGE", "BLOCKER", event, "Knowledge lacks a supported revelation", "The character uses information before a confirmed learning event supports it.", "Add or connect the missing revelation."));
      }
    }
    if (event.type === "READER_LEARNS_FACT") {
      const key = String(event.value ?? event.predicate ?? event.objectEntityId ?? "");
      const previous = readerReveals.get(key);
      if (previous) diagnostics.push(diagnostic("DUPLICATE_REVEAL", "RISK", event, "Reader already knows this", "The same fact is presented as newly revealed more than once.", "Review whether the later reveal is intentionally repeated.", [previous.id, event.id]));
      else readerReveals.set(key, event);
    }
    if (event.type === "SETUP_CREATED") setups.set(event.id, event);
    if (event.type === "PAYOFF_CREATED") paidSetups.add(String(event.objectEntityId ?? event.value ?? ""));
    if (event.coordinate.storySequence !== undefined && event.coordinate.storySequence < 0) {
      diagnostics.push(diagnostic("TIMELINE_ORDER_CONFLICT", "BLOCKER", event, "Story chronology is invalid", "This event has an impossible negative story position.", "Correct the event’s story coordinate."));
    }
  }

  for (const [setupId, event] of setups) {
    if (!paidSetups.has(setupId)) diagnostics.push(diagnostic("UNRESOLVED_SETUP", "RISK", event, "Setup has no supported payoff", "A confirmed setup reaches the project end without a linked payoff.", "Add a payoff, remove the setup, or mark it intentional."));
  }
  for (const event of ordered.filter((candidate) => candidate.type === "PAYOFF_CREATED")) {
    const setupId = String(event.objectEntityId ?? event.value ?? "");
    if (!setups.has(setupId)) diagnostics.push(diagnostic("ORPHANED_PAYOFF", "RISK", event, "Payoff lacks a supported setup", "This payoff does not connect to a confirmed setup.", "Connect a setup or revise the payoff."));
  }

  for (const dependency of dependencies) {
    if (!ordered.some((event) => event.id === dependency.sourceEventId) && ordered.some((event) => event.id === dependency.targetEventId)) {
      const target = ordered.find((event) => event.id === dependency.targetEventId)!;
      diagnostics.push(diagnostic("BRANCH_DEPENDENCY_BREAK", "BLOCKER", target, "A downstream action lost its cause", "This branch removed a required supporting event while retaining its dependent future event.", "Revise the dependent scene or restore a supported cause.", [dependency.sourceEventId, dependency.targetEventId]));
    }
  }
  return diagnostics;
}
