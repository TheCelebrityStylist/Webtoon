import { createCanvasState } from "./fixtures";
import { applyStructureCommand, createChapterRecord, createPartRecord, createSceneRecord } from "./structure";
import type { CanvasAction, CanvasState } from "./types";

const withProject = (state: CanvasState, project: CanvasState["project"], currentSceneId = state.currentSceneId): CanvasState => ({ ...state, project, projectTitle: project.title, scenes: project.scenes, currentSceneId });

export function storyReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case "OPEN_SCENE": return { ...state, currentSceneId: action.sceneId, mode: "write" };
    case "SET_MODE": return { ...state, mode: action.mode };
    case "UPDATE_SCENE": { const scenes = state.scenes.map((scene) => scene.id === action.sceneId ? { ...scene, content: action.content, wordCount: action.content.trim().split(/\s+/).filter(Boolean).length, lastEditedAt: new Date().toISOString() } : scene); return withProject(state, { ...state.project, scenes, updatedAt: new Date().toISOString() }); }
    case "SCENE_SAVED": { const scenes = state.scenes.map((scene) => scene.id === action.sceneId ? { ...scene, revision: action.revision } : scene); return withProject(state, { ...state.project, scenes }); }
    case "RENAME_SCENE": return storyReducer(state, { type: "STRUCTURE", command: { projectId: state.project.id, type: "rename-scene", id: action.sceneId, value: action.title } });
    case "CREATE_PART": return withProject(state, createPartRecord(state.project, action.title, action.position).project);
    case "CREATE_CHAPTER": return withProject(state, createChapterRecord(state.project, action.title, action.partId, action.position).project);
    case "CREATE_SCENE": { const chapterId = action.chapterId ?? state.project.chapters.find((chapter) => chapter.status === "active")?.id; if (!chapterId) return state; const result = createSceneRecord(state.project, chapterId, action.title, action.position); return withProject({ ...state, mode: "write" }, result.project, result.scene.id); }
    case "STRUCTURE": { const result = applyStructureCommand(state.project, action.command); const currentSceneId = result.selectedSceneId ?? (result.project.scenes.some((scene) => scene.id === state.currentSceneId) ? state.currentSceneId : result.project.scenes[0]?.id ?? ""); return withProject(state, result.project, currentSceneId); }
    case "SET_PROPOSALS": return { ...state, observations: [...state.observations.filter((item) => item.status !== "proposed"), ...action.proposals.filter((item) => !state.dismissedObservationKeys.includes(item.id))] };
    case "CONFIRM_PROPOSALS": { const observations = state.observations.map((item) => action.ids.includes(item.id) ? { ...item, status: "confirmed" as const } : item); const entities = state.entities.map((entity) => observations.filter((item) => action.ids.includes(item.id) && item.subjectId === entity.id).reduce((next, item) => item.predicate === "holder" ? { ...next, currentHolder: item.value, currentLocation: undefined } : item.predicate === "location" || item.predicate === "entered" ? { ...next, currentLocation: item.value, ...(item.predicate === "location" && entity.type === "object" ? { currentHolder: undefined } : {}) } : next, entity)); return { ...state, observations, entities }; }
    case "DISMISS_PROPOSAL": return { ...state, observations: state.observations.filter((item) => item.id !== action.id), dismissedObservationKeys: [...state.dismissedObservationKeys, action.id] };
    case "CREATE_ENTITY": return { ...state, entities: [...state.entities, action.entity], selectedEntityId: action.entity.id };
    case "UPDATE_ENTITY": return { ...state, entities: state.entities.map((item) => item.id === action.entity.id ? action.entity : item) };
    case "SELECT_ENTITY": return { ...state, selectedEntityId: action.id };
    case "SET_SYNC": return { ...state, sync: { ...state.sync, ...action.sync } };
    case "SET_OUTLINE": return { ...state, outlineExpanded: action.expanded };
    case "SET_FOCUS": return { ...state, focusMode: action.focus };
    case "DECIDE_FINDING": return { ...state, findings: state.findings.map((item) => item.id === action.id ? { ...item, status: action.status } : item) };
    case "SET_SETTING": return { ...state, [action.key]: action.value } as CanvasState;
    case "RESTORE": return action.state;
    case "RESET": return createCanvasState();
  }
}
