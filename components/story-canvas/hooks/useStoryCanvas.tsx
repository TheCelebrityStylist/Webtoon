"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { createCanvasState } from "@/lib/story-canvas/fixtures";
import { readCanvasState, writeCanvasState } from "@/lib/story-canvas/persistence";
import { storyReducer } from "@/lib/story-canvas/story-reducer";
import type { CanvasAction, CanvasState } from "@/lib/story-canvas/types";

type Context = { state: CanvasState; dispatch: (action: CanvasAction, undoable?: boolean) => void; undo: () => void; canUndo: boolean; saveStatus: "Saved" | "Saving" | "Offline"; notice: string; setNotice: (value: string) => void };
const StoryCanvasContext = createContext<Context | null>(null);

export function StoryCanvasProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(storyReducer, undefined, createCanvasState);
  const [saveStatus, setSaveStatus] = useState<Context["saveStatus"]>("Saved");
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const history = useRef<CanvasState[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const restored = readCanvasState(localStorage);
    rawDispatch({ type: "RESTORE", state: restored });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setSaveStatus(navigator.onLine ? "Saving" : "Offline");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      writeCanvasState(localStorage, state);
      setSaveStatus(navigator.onLine ? "Saved" : "Offline");
    }, 500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [state, hydrated]);

  const dispatch = useCallback((action: CanvasAction, undoable = true) => {
    if (undoable) history.current = [...history.current.slice(-29), stateRef.current];
    rawDispatch(action);
  }, []);
  const undo = useCallback(() => {
    const previous = history.current.pop();
    if (!previous) return setNotice("Nothing to undo");
    rawDispatch({ type: "RESTORE", state: previous });
    setNotice("Previous story state restored");
  }, []);
  const value = useMemo(() => ({ state, dispatch, undo, canUndo: history.current.length > 0, saveStatus, notice, setNotice }), [state, dispatch, undo, saveStatus, notice]);
  return <StoryCanvasContext.Provider value={value}>{children}</StoryCanvasContext.Provider>;
}

export function useStoryCanvas() {
  const context = useContext(StoryCanvasContext);
  if (!context) throw new Error("useStoryCanvas must be used inside StoryCanvasProvider");
  return context;
}
