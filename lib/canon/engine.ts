export type CanonValue = null | boolean | number | string | CanonValue[] | { [key: string]: CanonValue };
export type Transition = { id: string; entityId: string; sequence: number; property: string; beforeValue?: CanonValue; afterValue: CanonValue; status: "PROPOSED" | "CONFIRMED" | "REJECTED"; dependsOn?: string[] };
export type EntityState = { entityId: string; sequence: number; values: Record<string, CanonValue> };

export function reconstructState(entityId: string, sequence: number, transitions: Transition[]): EntityState {
  const values: Record<string, CanonValue> = {};
  for (const transition of transitions
    .filter(item => item.entityId === entityId && item.sequence <= sequence && item.status === "CONFIRMED")
    .sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id))) values[transition.property] = transition.afterValue;
  return { entityId, sequence, values };
}

export function reconstructWorld(sequence: number, transitions: Transition[]) {
  const ids = [...new Set(transitions.map(item => item.entityId))];
  return Object.fromEntries(ids.map(id => [id, reconstructState(id, sequence, transitions)]));
}

export type Consequence = { transitionId: string; reason: string; depth: number };
export function previewConsequences(changedIds: string[], transitions: Transition[]): Consequence[] {
  const seen = new Set(changedIds), queue = changedIds.map(id => ({ id, depth: 0 })), result: Consequence[] = [];
  while (queue.length) {
    const current = queue.shift()!;
    for (const candidate of transitions) {
      if (seen.has(candidate.id) || !(candidate.dependsOn ?? []).includes(current.id)) continue;
      seen.add(candidate.id); result.push({ transitionId: candidate.id, reason: `Depends on ${current.id}`, depth: current.depth + 1 }); queue.push({ id: candidate.id, depth: current.depth + 1 });
    }
  }
  return result.sort((a,b)=>a.depth-b.depth||a.transitionId.localeCompare(b.transitionId));
}

export type PerspectiveFact = { subject: string; predicate: string; perspective: "REALITY"|"NARRATOR"|"READER"|"CHARACTER_KNOWLEDGE"|"CHARACTER_BELIEF"|"DECEPTION"; perspectiveEntityId?: string; value: CanonValue; sequence: number };
export function findPerspectiveConflicts(facts: PerspectiveFact[]) {
  const reality = facts.filter(f=>f.perspective==="REALITY");
  return facts.filter(f=>f.perspective!=="REALITY").flatMap(f=>{const truth=reality.filter(r=>r.subject===f.subject&&r.predicate===f.predicate&&r.sequence<=f.sequence).sort((a,b)=>b.sequence-a.sequence)[0];return truth&&JSON.stringify(truth.value)!==JSON.stringify(f.value)?[{fact:f,truth,intentional:f.perspective==="DECEPTION"||f.perspective==="CHARACTER_BELIEF"}]:[]});
}
