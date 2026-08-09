import type { NarrativeEvent, NarrativeProjection } from "../domain/types";
import { replayIncrementally, replayProjection } from "./projection-builder";

export function earliestAffectedSequence(events: NarrativeEvent[]) {
  return events.reduce((minimum, event) => Math.min(minimum, event.coordinate.manuscriptSequence), Number.MAX_SAFE_INTEGER);
}

export function incrementalReplay(
  branchId: string,
  allEvents: NarrativeEvent[],
  previous: NarrativeProjection | undefined,
  changedEvents: NarrativeEvent[],
) {
  if (!previous || earliestAffectedSequence(changedEvents) <= previous.atManuscriptSequence) {
    return replayProjection(branchId, allEvents);
  }
  return replayIncrementally(previous, changedEvents);
}
