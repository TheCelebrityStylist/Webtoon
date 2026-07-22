"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateImpact } from "@/lib/story-canvas/impact-engine";
import type { CanvasMode, StoryEntity, StoryObservation } from "@/lib/story-canvas/types";
import { LivingEditor } from "./LivingEditor";
import { StoryLens } from "./StoryLens";
import { StoryOutline } from "./StoryOutline";
import { StoryPulse } from "./StoryPulse";
import { StoryTopBar } from "./StoryTopBar";
import { CommandPalette, ReviewDrawer, SettingsPopover, StoryLibrary } from "./StoryOverlays";
import { useStoryCanvas } from "./hooks/useStoryCanvas";

const StoryMap = dynamic(() => import("./StoryMap").then((module) => module.StoryMap), { loading: () => <p className="canvas-loading">Drawing the story…</p> });
const StoryTrace = dynamic(() => import("./StoryTrace").then((module) => module.StoryTrace), { loading: () => <p className="canvas-loading">Following the trail…</p> });

type Panel = "library" | "review" | "settings" | "commands" | null;

export function StoryCanvas() {
  const { state, dispatch, undo, saveStatus, notice, setNotice } = useStoryCanvas();
  const router = useRouter();
  const params = useSearchParams();
  const [panel, setPanel] = useState<Panel>(null);
  const [lensId, setLensId] = useState<string | null>(null);
  const [lensPinned, setLensPinned] = useState(false);
  const [pulseExpanded, setPulseExpanded] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const currentScene = state.scenes.find((scene) => scene.id === state.currentSceneId) ?? state.scenes[0];
  const lens = state.entities.find((entity) => entity.id === lensId) ?? null;
  const traceEntity = state.entities.find((entity) => entity.id === params.get("entity")) ?? (state.mode === "trace" ? lens : null);
  const proposals = state.observations.filter((item) => item.status === "proposed" && item.sceneId === currentScene.id);
  const impact = useMemo(() => proposals.map((proposal) => calculateImpact(state, proposal)).find(Boolean) ?? null, [proposals, state]);
  const openFindings = state.findings.filter((finding) => finding.status === "open");

  const setUrl = useCallback((mode: CanvasMode, nextPanel?: Panel, entity?: string) => {
    const query = new URLSearchParams();
    query.set("mode", mode);
    if (nextPanel && nextPanel !== "commands") query.set("panel", nextPanel);
    if (entity) query.set("entity", entity);
    router.replace(`/studio-demo?${query}`);
  }, [router]);

  const setMode = useCallback((mode: CanvasMode) => { dispatch({ type: "SET_MODE", mode }, false); setUrl(mode, panel, mode === "trace" ? lensId ?? undefined : undefined); }, [dispatch, lensId, panel, setUrl]);
  const openScene = useCallback((id: string) => { dispatch({ type: "OPEN_SCENE", sceneId: id }, false); setUrl("write"); requestAnimationFrame(() => document.querySelector<HTMLElement>(".manuscript")?.focus()); }, [dispatch, setUrl]);
  const openPanel = useCallback((value: Panel) => { setPanel(value); setUrl(state.mode, value, state.mode === "trace" ? traceEntity?.id : undefined); }, [setUrl, state.mode, traceEntity?.id]);

  useEffect(() => {
    const mode = params.get("mode") as CanvasMode | null;
    if (mode && ["write", "map", "trace"].includes(mode) && mode !== state.mode) dispatch({ type: "SET_MODE", mode }, false);
    const nextPanel = params.get("panel") as Panel;
    if (nextPanel && ["library", "review", "settings"].includes(nextPanel)) setPanel(nextPanel);
  }, [dispatch, params, state.mode]);
  useEffect(() => {
    if (window.innerWidth <= 600 && state.outlineExpanded) dispatch({ type: "SET_OUTLINE", expanded: false }, false);
  }, [dispatch, state.outlineExpanded]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPanel("commands"); }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "l") { event.preventDefault(); openPanel("library"); }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && proposals.length) { event.preventDefault(); confirm(proposals.map((item) => item.id)); }
      if (event.key === "Escape") { setPanel(null); if (!lensPinned) setLensId(null); }
    };
    addEventListener("keydown", key); return () => removeEventListener("keydown", key);
  });

  const analyze = useCallback((next: StoryObservation[]) => { dispatch({ type: "SET_PROPOSALS", proposals: next }); setPulseExpanded(false); }, [dispatch]);
  const confirm = (ids: string[]) => { dispatch({ type: "CONFIRM_PROPOSALS", ids }); setPulseExpanded(false); setNotice("Story updated · Undo"); setTimeout(() => setNotice(""), 8000); };
  const openEntity = (id: string) => { setLensId(id); if (state.mode === "trace") setUrl("trace", null, id); };
  const createEntity = (name: string, type: StoryEntity["type"]) => { const id = `${type}-${Date.now()}`; dispatch({ type: "CREATE_ENTITY", entity: { id, name, type, aliases: [], appearances: [currentScene.id] } }); setPanel(null); setLensId(id); setNotice(`${name} added · Undo`); requestAnimationFrame(() => document.querySelector<HTMLElement>(".manuscript")?.focus()); };
  const command = (value: string) => { if (value === "Open Library") openPanel("library"); else if (value === "Open Review") openPanel("review"); else if (value === "Toggle Focus") dispatch({ type: "SET_FOCUS", focus: !state.focusMode }); else if (value === "Reset demo") dispatch({ type: "RESET" }); else if (value === "Create scene") dispatch({ type: "CREATE_SCENE", title: "Untitled scene" }); else if (value.startsWith("entity:")) openEntity(value.slice(7)); else if (value.startsWith("Create ")) openPanel("library"); };

  return <div className={`story-canvas mode-${state.mode} ${state.focusMode ? "focus" : ""} ${state.reducedMotion ? "reduce-motion" : ""}`}>
    <StoryTopBar project={state.projectTitle} breadcrumb={`${currentScene.chapterId.replace("chapter-", "Chapter ")} / ${currentScene.title}`} mode={state.mode} reviewCount={openFindings.length} saveStatus={saveStatus} focus={state.focusMode} onMode={setMode} onLibrary={() => openPanel("library")} onReview={() => openPanel("review")} onSearch={() => setPanel("commands")} onSettings={() => openPanel("settings")} onExitFocus={() => dispatch({ type: "SET_FOCUS", focus: false })}/>
    {state.mode === "write" && <><StoryOutline scenes={state.scenes} currentSceneId={currentScene.id} expanded={state.outlineExpanded && !state.focusMode} onToggle={() => dispatch({ type: "SET_OUTLINE", expanded: !state.outlineExpanded }, false)} onOpen={openScene} onCreate={(title) => dispatch({ type: "CREATE_SCENE", title })}/><div className="write-canvas"><LivingEditor scene={currentScene} entities={state.entities} observations={state.observations} pulseEnabled={state.pulseEnabled} textSize={state.textSize} onChange={(content) => dispatch({ type: "UPDATE_SCENE", sceneId: currentScene.id, content })} onAnalyze={analyze} onEntity={openEntity} onFocusMode={() => dispatch({ type: "SET_FOCUS", focus: !state.focusMode }, false)}/>{lens && <StoryLens entity={lens} scenes={state.scenes} observations={state.observations} pinned={lensPinned} onClose={() => setLensId(null)} onPin={() => setLensPinned((value) => !value)} onTrace={() => { dispatch({ type: "SET_MODE", mode: "trace" }, false); setUrl("trace", null, lens.id); }} onSource={openScene}/>}</div><StoryPulse proposals={proposals} impact={impact} expanded={pulseExpanded} onExpand={() => setPulseExpanded((value) => !value)} onConfirm={confirm} onDismiss={(id) => dispatch({ type: "DISMISS_PROPOSAL", id })} onReviewScene={openScene} onUndo={undo}/></>}
    {state.mode === "map" && <StoryMap scenes={state.scenes} entities={state.entities} currentSceneId={currentScene.id} onOpen={openScene}/>} 
    {state.mode === "trace" && <StoryTrace entity={traceEntity} entities={state.entities} scenes={state.scenes} observations={state.observations} onSelect={(id) => setUrl("trace", null, id || undefined)} onSource={openScene}/>} 
    {panel === "library" && <StoryLibrary entities={state.entities} onClose={() => { setPanel(null); setUrl(state.mode); }} onOpen={(id) => { setPanel(null); openEntity(id); }} onCreate={createEntity}/>} 
    {panel === "review" && <ReviewDrawer findings={openFindings} index={reviewIndex} onClose={() => { setPanel(null); setUrl(state.mode); }} onNext={() => setReviewIndex((value) => openFindings.length ? (value + 1) % openFindings.length : 0)} onDecide={(id, status) => { dispatch({ type: "DECIDE_FINDING", id, status }); setReviewIndex(0); }} onSource={openScene}/>} 
    {panel === "commands" && <CommandPalette scenes={state.scenes} entities={state.entities} onClose={() => setPanel(null)} onMode={setMode} onScene={openScene} onCommand={command}/>} 
    {panel === "settings" && <SettingsPopover wordTarget={state.wordTarget} pulse={state.pulseEnabled} reducedMotion={state.reducedMotion} textSize={state.textSize} onSetting={(key, value) => dispatch({ type: "SET_SETTING", key, value })} onReset={() => dispatch({ type: "RESET" })} onClose={() => { setPanel(null); setUrl(state.mode); }}/>} 
    {notice && <button className="canvas-toast" onClick={() => { if (notice.includes("Undo")) undo(); setNotice(""); }}>{notice}</button>}
  </div>;
}
