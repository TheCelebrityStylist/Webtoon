import { createCanvasState } from "./fixtures";
import type { CanvasState } from "./types";

export const STORY_CANVAS_KEY = "morrow.story-canvas.v2";

export function readCanvasState(storage: Pick<Storage, "getItem">): CanvasState {
  try {
    const parsed = JSON.parse(storage.getItem(STORY_CANVAS_KEY) ?? "null") as Partial<CanvasState> | null;
    if (!parsed || parsed.version !== 2 || !Array.isArray(parsed.scenes) || !Array.isArray(parsed.entities)) return createCanvasState();
    return { ...createCanvasState(), ...parsed };
  } catch {
    return createCanvasState();
  }
}

export function writeCanvasState(storage: Pick<Storage, "setItem">, state: CanvasState) {
  storage.setItem(STORY_CANVAS_KEY, JSON.stringify(state));
}
