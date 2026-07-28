"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { LocalDemoStoryDataSource, ProductionStoryDataSource } from "@/lib/story-canvas/data-source";
import { createCanvasState } from "@/lib/story-canvas/fixtures";
import { writeIndexedCanvasState } from "@/lib/story-canvas/persistence";
import { storyReducer } from "@/lib/story-canvas/story-reducer";
import type { CanvasAction, CanvasState, CreateChapterInput, CreateEntityInput, CreatePartInput, CreateSceneInput, StoryWorkspaceDataSource, StructureCommand } from "@/lib/story-canvas/types";
import { DemoStoryworldDataSource, ProductionStoryworldDataSource, type StoryworldDataSource } from "@/lib/storyworld/data-source";

type Context = {
  state: CanvasState; dispatch: (action: CanvasAction, undoable?: boolean) => void; undo: () => void; canUndo: boolean;
  saveStatus: "Saved locally" | "Saving" | "Saved" | "Offline" | "Conflict"; notice: string; setNotice: (value: string) => void; dataSource: StoryWorkspaceDataSource; storyworldSource: StoryworldDataSource;
  createPart: (input?: Partial<CreatePartInput>) => Promise<void>; createChapter: (input?: Partial<CreateChapterInput>) => Promise<void>; createScene: (input?: Partial<CreateSceneInput>) => Promise<void>;
  createEntity: (input: Omit<CreateEntityInput, "projectId"> & { projectId?: string }) => Promise<string>; structure: (command: Omit<StructureCommand, "projectId">) => Promise<void>;
};
const StoryCanvasContext = createContext<Context | null>(null);

export function StoryCanvasProvider({ children, projectId = "museum-of-lost-hours", mode = "demo", initialState }: { children: ReactNode; projectId?: string; mode?: "demo" | "production"; initialState?: CanvasState }) {
  const [state, rawDispatch] = useReducer(storyReducer, initialState ?? createCanvasState());
  const source = useMemo<StoryWorkspaceDataSource>(() => mode === "production" ? new ProductionStoryDataSource(projectId) : new LocalDemoStoryDataSource(), [mode, projectId]);
  const storyworldSource = useMemo<StoryworldDataSource>(() => mode === "production" ? new ProductionStoryworldDataSource(projectId) : new DemoStoryworldDataSource(projectId), [mode, projectId]);
  const [saveStatus, setSaveStatus] = useState<Context["saveStatus"]>(mode === "demo" ? "Saved locally" : "Saved");
  const [notice, setNotice] = useState(""); const [hydrated, setHydrated] = useState(Boolean(initialState));
  const history = useRef<CanvasState[]>([]); const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const stateRef = useRef(state); stateRef.current = state;

  useEffect(() => { if (initialState) return; let active = true; source.loadProject(projectId).then((restored) => { if (active) rawDispatch({ type: "RESTORE", state: { ...restored, dataMode: mode } }); }).catch(() => setSaveStatus(navigator.onLine ? "Conflict" : "Offline")).finally(() => setHydrated(true)); return () => { active = false; }; }, [initialState, mode, projectId, source]);
  useEffect(() => { if (!hydrated) return; setSaveStatus(navigator.onLine ? "Saving" : "Offline"); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(async () => { try { await writeIndexedCanvasState(state); setSaveStatus("Saved locally"); } catch { setSaveStatus("Conflict"); } }, 450); return () => { if (timer.current) clearTimeout(timer.current); }; }, [state, hydrated]);

  const dispatch = useCallback((action: CanvasAction, undoable = true) => { if (undoable) history.current = [...history.current.slice(-49), structuredClone(stateRef.current)]; rawDispatch(action); }, []);
  const undo = useCallback(() => { const previous = history.current.pop(); if (!previous) return setNotice("Nothing to undo"); rawDispatch({ type: "RESTORE", state: previous }); setNotice("Previous story state restored"); }, []);
  const optimistic = useCallback(async (action: CanvasAction, effect: () => Promise<unknown>) => { const before = structuredClone(stateRef.current); dispatch(action); try { await effect(); } catch (error) { rawDispatch({ type: "RESTORE", state: before }); setNotice(error instanceof Error ? error.message : "That change could not be saved"); throw error; } }, [dispatch]);
  const createPart = useCallback(async (input: Partial<CreatePartInput> = {}) => optimistic({ type: "CREATE_PART", title: input.title, position: input.position }, () => source.createPart({ projectId: stateRef.current.project.id, title: input.title, position: input.position })), [optimistic, source]);
  const createChapter = useCallback(async (input: Partial<CreateChapterInput> = {}) => optimistic({ type: "CREATE_CHAPTER", title: input.title, partId: input.partId, position: input.position }, () => source.createChapter({ projectId: stateRef.current.project.id, title: input.title, partId: input.partId, position: input.position })), [optimistic, source]);
  const createScene = useCallback(async (input: Partial<CreateSceneInput> = {}) => { const chapterId = input.chapterId ?? stateRef.current.project.chapters.find((item) => item.status === "active")?.id; if (!chapterId) throw new Error("Create a chapter first"); return optimistic({ type: "CREATE_SCENE", title: input.title, chapterId, position: input.position }, () => source.createScene({ projectId: stateRef.current.project.id, title: input.title, chapterId, position: input.position })); }, [optimistic, source]);
  const createEntity = useCallback(async (input: Omit<CreateEntityInput, "projectId"> & { projectId?: string }) => { const entity = await source.createEntity({ ...input, projectId: stateRef.current.project.id }); dispatch({ type: "CREATE_ENTITY", entity }); return entity.id; }, [dispatch, source]);
  const structure = useCallback(async (command: Omit<StructureCommand, "projectId">) => optimistic({ type: "STRUCTURE", command: { ...command, projectId: stateRef.current.project.id } }, () => source.updateStructure({ ...command, projectId: stateRef.current.project.id })), [optimistic, source]);
  const value = useMemo(() => ({ state, dispatch, undo, canUndo: history.current.length > 0, saveStatus, notice, setNotice, dataSource: source, storyworldSource, createPart, createChapter, createScene, createEntity, structure }), [state, dispatch, undo, saveStatus, notice, source, storyworldSource, createPart, createChapter, createScene, createEntity, structure]);
  return <StoryCanvasContext.Provider value={value}>{children}</StoryCanvasContext.Provider>;
}

export function useStoryCanvas() { const context = useContext(StoryCanvasContext); if (!context) throw new Error("useStoryCanvas must be used inside StoryCanvasProvider"); return context; }
