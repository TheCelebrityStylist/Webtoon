import type { EntityProjectionState, NarrativeEvent, NarrativeProjection } from "../domain/types";

const emptyState = (entityId: string): EntityProjectionState => ({
  entityId,
  introduced: false,
  knowledge: {},
  beliefs: {},
  deceptions: {},
  relationships: [],
  questions: {},
  setups: {},
  readerKnowledge: [],
});

function stateFor(projection: NarrativeProjection, entityId: string) {
  return projection.entities[entityId] ??= emptyState(entityId);
}

function factKey(event: NarrativeEvent) {
  return String(event.value ?? event.predicate ?? event.objectEntityId ?? event.id);
}

export function applyNarrativeEvent(projection: NarrativeProjection, event: NarrativeEvent): NarrativeProjection {
  if (event.status !== "CONFIRMED" && event.status !== "INTENTIONAL_EXCEPTION") return projection;
  const subjectId = event.subjectEntityId ?? event.objectEntityId ?? `event:${event.id}`;
  const state = stateFor(projection, subjectId);
  state.lastEventId = event.id;

  switch (event.type) {
    case "ENTITY_INTRODUCED":
      state.introduced = true;
      break;
    case "CHARACTER_ENTERS_LOCATION":
    case "OBJECT_MOVED":
      state.locationId = event.objectEntityId ?? String(event.value ?? "");
      break;
    case "CHARACTER_LEAVES_LOCATION":
      if (!event.objectEntityId || state.locationId === event.objectEntityId) delete state.locationId;
      break;
    case "OBJECT_ACQUIRED":
      state.holderId = event.objectEntityId ?? String(event.value ?? "");
      state.ownerId ??= state.holderId;
      delete state.locationId;
      break;
    case "OBJECT_TRANSFERRED":
      state.holderId = event.objectEntityId ?? String(event.value ?? "");
      delete state.locationId;
      break;
    case "OBJECT_DROPPED":
    case "OBJECT_HIDDEN":
      delete state.holderId;
      state.locationId = event.objectEntityId ?? String(event.value ?? "");
      state.condition = event.type === "OBJECT_HIDDEN" ? "HIDDEN" : state.condition;
      break;
    case "OBJECT_DESTROYED":
      delete state.holderId;
      state.condition = "DESTROYED";
      break;
    case "CHARACTER_LEARNS_FACT": {
      const perspectiveId = "perspectiveEntityId" in event.perspective
        ? event.perspective.perspectiveEntityId
        : subjectId;
      (stateFor(projection, perspectiveId).knowledge[factKey(event)] ??= []).push(event.id);
      break;
    }
    case "CHARACTER_BELIEVES_FACT": {
      const perspectiveId = "perspectiveEntityId" in event.perspective
        ? event.perspective.perspectiveEntityId
        : subjectId;
      (stateFor(projection, perspectiveId).beliefs[factKey(event)] ??= []).push(event.id);
      break;
    }
    case "CHARACTER_IS_DECEIVED": {
      const perspectiveId = "perspectiveEntityId" in event.perspective
        ? event.perspective.perspectiveEntityId
        : subjectId;
      (stateFor(projection, perspectiveId).deceptions[factKey(event)] ??= []).push(event.id);
      break;
    }
    case "READER_LEARNS_FACT":
      if (!state.readerKnowledge.includes(factKey(event))) state.readerKnowledge.push(factKey(event));
      break;
    case "QUESTION_INTRODUCED":
      state.questions[event.id] = "OPEN";
      break;
    case "QUESTION_ESCALATED":
      state.questions[String(event.objectEntityId ?? event.value ?? event.id)] = "ESCALATED";
      break;
    case "QUESTION_RESOLVED":
      state.questions[String(event.objectEntityId ?? event.value ?? event.id)] = "RESOLVED";
      break;
    case "SETUP_CREATED":
      state.setups[event.id] = {};
      break;
    case "PAYOFF_CREATED": {
      const setupId = String(event.objectEntityId ?? event.value ?? "");
      if (setupId) (state.setups[setupId] ??= {}).payoffEventId = event.id;
      break;
    }
    case "RELATIONSHIP_FACT_CONFIRMED":
      if (event.predicate && event.objectEntityId) state.relationships.push({ predicate: event.predicate, objectEntityId: event.objectEntityId });
      break;
    case "CHARACTER_STATUS_CHANGED":
      state.status = String(event.value ?? event.predicate ?? "");
      break;
    case "LOCATION_STATE_CHANGED":
      state.condition = String(event.value ?? event.predicate ?? "");
      break;
  }
  projection.atManuscriptSequence = Math.max(projection.atManuscriptSequence, event.coordinate.manuscriptSequence);
  projection.lastEventId = event.id;
  return projection;
}

export function replayProjection(branchId: string, events: NarrativeEvent[], through = Number.MAX_SAFE_INTEGER): NarrativeProjection {
  const projection: NarrativeProjection = { branchId, atManuscriptSequence: 0, entities: {} };
  return events
    .filter((event) => event.coordinate.manuscriptSequence <= through)
    .sort((a, b) => a.coordinate.manuscriptSequence - b.coordinate.manuscriptSequence || a.id.localeCompare(b.id))
    .reduce(applyNarrativeEvent, projection);
}

export function replayIncrementally(base: NarrativeProjection, events: NarrativeEvent[]): NarrativeProjection {
  const copy = structuredClone(base);
  return events
    .filter((event) => event.coordinate.manuscriptSequence > base.atManuscriptSequence || (event.coordinate.manuscriptSequence === base.atManuscriptSequence && event.id.localeCompare(base.lastEventId ?? "") > 0))
    .sort((a, b) => a.coordinate.manuscriptSequence - b.coordinate.manuscriptSequence || a.id.localeCompare(b.id))
    .reduce(applyNarrativeEvent, copy);
}
