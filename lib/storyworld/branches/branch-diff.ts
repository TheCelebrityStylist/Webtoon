import type { NarrativeDiagnostic, NarrativeEvent, NarrativeProjection } from "../domain/types";

export type BranchDifference = {
  id: string;
  kind: "ADDED" | "REMOVED" | "CHANGED" | "INVALIDATED" | "RESOLVED" | "INTRODUCED_RISK";
  recordType: "EVENT" | "ENTITY_STATE" | "DIAGNOSTIC";
  recordId: string;
  main?: unknown;
  branch?: unknown;
};

export function compareBranchState(input: {
  mainEvents: NarrativeEvent[];
  branchEvents: NarrativeEvent[];
  mainProjection: NarrativeProjection;
  branchProjection: NarrativeProjection;
  mainDiagnostics: NarrativeDiagnostic[];
  branchDiagnostics: NarrativeDiagnostic[];
}): BranchDifference[] {
  const result: BranchDifference[] = [];
  const compare = <T extends { id: string }>(recordType: BranchDifference["recordType"], main: T[], branch: T[]) => {
    const mainById = new Map(main.map((item) => [item.id, item]));
    const branchById = new Map(branch.map((item) => [item.id, item]));
    for (const [id, value] of branchById) {
      if (!mainById.has(id)) result.push({ id: `${recordType}:added:${id}`, kind: recordType === "DIAGNOSTIC" ? "INTRODUCED_RISK" : "ADDED", recordType, recordId: id, branch: value });
      else if (JSON.stringify(mainById.get(id)) !== JSON.stringify(value)) result.push({ id: `${recordType}:changed:${id}`, kind: "CHANGED", recordType, recordId: id, main: mainById.get(id), branch: value });
    }
    for (const [id, value] of mainById) if (!branchById.has(id)) result.push({ id: `${recordType}:removed:${id}`, kind: recordType === "DIAGNOSTIC" ? "RESOLVED" : "REMOVED", recordType, recordId: id, main: value });
  };
  compare("EVENT", input.mainEvents, input.branchEvents);
  compare("DIAGNOSTIC", input.mainDiagnostics, input.branchDiagnostics);
  const entityIds = new Set([...Object.keys(input.mainProjection.entities), ...Object.keys(input.branchProjection.entities)]);
  for (const id of entityIds) {
    const main = input.mainProjection.entities[id];
    const branch = input.branchProjection.entities[id];
    if (JSON.stringify(main) !== JSON.stringify(branch)) result.push({ id: `ENTITY_STATE:changed:${id}`, kind: "CHANGED", recordType: "ENTITY_STATE", recordId: id, main, branch });
  }
  return result;
}
