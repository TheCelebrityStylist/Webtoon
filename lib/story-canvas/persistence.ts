import { createCanvasState } from "./fixtures";
import type { CanvasState } from "./types";
import { manuscriptText, normalizeManuscript } from "./manuscript";

export const STORY_CANVAS_KEY = "morrow.story-canvas.v3";
const DB_NAME = "morrow-story-workspace";
const STORE = "projects";

export function normalizeCanvasState(value: Partial<CanvasState> | null): CanvasState {
  const seed = createCanvasState();
  if (!value || value.version !== 3 || !value.project || !Array.isArray(value.scenes) || !Array.isArray(value.entities)) return seed;
  const scenes = value.scenes.map((scene) => {
    const legacy = scene as typeof scene & { content?: string };
    const document = normalizeManuscript(legacy.manuscriptJson, legacy.manuscriptText ?? legacy.content ?? "", scene.id);
    const text = legacy.manuscriptText ?? legacy.content ?? manuscriptText(document);
    return { ...scene, manuscriptJson: document, manuscriptText: text, content: text };
  });
  return { ...seed, ...value, scenes, project: { ...seed.project, ...value.project, scenes }, sync: { ...seed.sync, ...value.sync } };
}

export function readCanvasState(storage: Pick<Storage, "getItem">): CanvasState {
  try { return normalizeCanvasState(JSON.parse(storage.getItem(STORY_CANVAS_KEY) ?? "null") as Partial<CanvasState> | null); } catch { return createCanvasState(); }
}
export function writeCanvasState(storage: Pick<Storage, "setItem">, state: CanvasState) { storage.setItem(STORY_CANVAS_KEY, JSON.stringify(state)); }

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, 1); request.onupgradeneeded = () => request.result.createObjectStore(STORE); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
}
export async function readIndexedCanvasState(projectId: string): Promise<CanvasState | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await database();
  return new Promise((resolve, reject) => { const request = db.transaction(STORE, "readonly").objectStore(STORE).get(projectId); request.onsuccess = () => resolve(request.result ? normalizeCanvasState(request.result as CanvasState) : null); request.onerror = () => reject(request.error); });
}
export async function writeIndexedCanvasState(state: CanvasState): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await database();
  await new Promise<void>((resolve, reject) => { const transaction = db.transaction(STORE, "readwrite"); transaction.objectStore(STORE).put(structuredClone(state), state.project.id); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
}
