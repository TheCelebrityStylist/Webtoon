import { createCanvasState } from "./fixtures";
import type { CanvasAction, CanvasState } from "./types";

export function storyReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case "OPEN_SCENE": return { ...state, currentSceneId: action.sceneId, mode: "write" };
    case "SET_MODE": return { ...state, mode: action.mode };
    case "UPDATE_SCENE": return { ...state, scenes: state.scenes.map((scene) => scene.id === action.sceneId ? { ...scene, content: action.content } : scene) };
    case "RENAME_SCENE": return { ...state, scenes: state.scenes.map((scene) => scene.id === action.sceneId ? { ...scene, title: action.title } : scene) };
    case "CREATE_SCENE": {
      const id = `scene-${Date.now()}`;
      return { ...state, currentSceneId: id, mode: "write", scenes: [...state.scenes, { id, chapterId: "chapter-3", title: action.title || "Untitled scene", content: "", location: "", people: [], objects: [], summary: "", order: state.scenes.length }] };
    }
    case "SET_PROPOSALS": return { ...state, observations: [...state.observations.filter((item) => item.status !== "proposed"), ...action.proposals.filter((item) => !state.dismissedObservationKeys.includes(item.id))] };
    case "CONFIRM_PROPOSALS": {
      const observations = state.observations.map((item) => action.ids.includes(item.id) ? { ...item, status: "confirmed" as const } : item);
      const entities = state.entities.map((entity) => {
        const changes = observations.filter((item) => action.ids.includes(item.id) && item.subjectId === entity.id);
        return changes.reduce((next, item) => item.predicate === "holder" ? { ...next, currentHolder: item.value, currentLocation: undefined } : item.predicate === "location" || item.predicate === "entered" ? { ...next, currentLocation: item.value, ...(item.predicate === "location" && entity.type === "object" ? { currentHolder: undefined } : {}) } : next, entity);
      });
      return { ...state, observations, entities };
    }
    case "DISMISS_PROPOSAL": return { ...state, observations: state.observations.filter((item) => item.id !== action.id), dismissedObservationKeys: [...state.dismissedObservationKeys, action.id] };
    case "CREATE_ENTITY": return { ...state, entities: [...state.entities, action.entity] };
    case "SET_OUTLINE": return { ...state, outlineExpanded: action.expanded };
    case "SET_FOCUS": return { ...state, focusMode: action.focus };
    case "DECIDE_FINDING": return { ...state, findings: state.findings.map((item) => item.id === action.id ? { ...item, status: action.status } : item) };
    case "SET_SETTING": return { ...state, [action.key]: action.value } as CanvasState;
    case "RESTORE": return action.state;
    case "RESET": return createCanvasState();
  }
}
