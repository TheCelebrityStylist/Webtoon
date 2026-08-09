"use client";
/* eslint-disable react-hooks/exhaustive-deps -- derived proposal arrays intentionally key impact recalculation. */
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateImpact } from "@/lib/story-canvas/impact-engine";
import { defaultBranchName } from "@/lib/storyworld/branches/branch-name";
import type {
  CanvasMode,
  EntityType,
  GoogleImportPreview,
  StoryAnalysisResult,
} from "@/lib/story-canvas/types";
import { StoryLens } from "./StoryLens";
import { StoryOutline } from "./StoryOutline";
import { StoryPulse } from "./StoryPulse";
import { StoryTopBar } from "./StoryTopBar";
import { GlobalCreate } from "./StoryCreate";
import { WorkspaceSync } from "./WorkspaceSync";
import { GooglePickerBridge } from "./GooglePickerBridge";
import { StoryLibrary } from "./StoryLibraryCompat";
import { CommandPalette, ReviewDrawer, SettingsPopover } from "./StoryOverlays";
import { useStoryCanvas } from "./hooks/useStoryCanvas";
import { StoryTimeMachine } from "./StoryTimeMachine";
const StoryMap = dynamic(
  () => import("./StoryMap").then((module) => module.StoryMap),
  {
    loading: () => (
      <p className="canvas-loading">Reconstructing the storyworld…</p>
    ),
  },
);
const StoryBranches = dynamic(
  () => import("./StoryBranches").then((module) => module.StoryBranches),
  { loading: () => <p className="canvas-loading">Loading branch history…</p> },
);
const LivingEditor = dynamic(
  () => import("./LivingEditor").then((module) => module.LivingEditor),
  {
    ssr: false,
    loading: () => <p className="canvas-loading">Opening the manuscript…</p>,
  },
);
type Panel =
  | "create"
  | "library"
  | "review"
  | "settings"
  | "commands"
  | "sync"
  | null;

export function StoryCanvas() {
  const analysis = useRef<StoryAnalysisResult | null>(null);
  const { storyworldSource } = useStoryCanvas();
  const {
    state,
    dispatch,
    undo,
    saveStatus,
    notice,
    setNotice,
    createPart,
    createChapter,
    createScene,
    createEntity,
    structure,
    dataSource,
  } = useStoryCanvas();
  const router = useRouter();
  const params = useSearchParams();
  const [panel, setPanel] = useState<Panel>(null);
  const [lensId, setLensId] = useState<string | null>(null);
  const [lensPinned, setLensPinned] = useState(false);
  const [pulseExpanded, setPulseExpanded] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [storySequence, setStorySequence] = useState(9);
  const [activeBranch, setActiveBranch] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const currentScene =
    state.scenes.find((scene) => scene.id === state.currentSceneId) ??
    state.scenes[0];
  const currentChapter = currentScene
    ? state.project.chapters.find(
        (chapter) => chapter.id === currentScene.chapterId,
      )
    : state.project.chapters[0];
  const lens = state.entities.find((entity) => entity.id === lensId) ?? null;
  const proposals = currentScene
    ? state.observations.filter(
        (item) =>
          item.status === "proposed" && item.sceneId === currentScene.id,
      )
    : [];
  const impact = useMemo(
    () =>
      proposals
        .map((proposal) => calculateImpact(state, proposal))
        .find(Boolean) ?? null,
    [proposals, state],
  );
  const openFindings = state.findings.filter(
    (finding) => finding.status === "open",
  );
  const basePath =
    state.dataMode === "demo"
      ? "/studio-demo"
      : `/studio/projects/${state.project.id}/chapters/${currentScene?.id ?? ""}`;
  const setUrl = useCallback(
    (mode: CanvasMode, nextPanel?: Panel, entity?: string) => {
      const query = new URLSearchParams();
      query.set("mode", mode);
      if (nextPanel && !["commands", "create"].includes(nextPanel))
        query.set("panel", nextPanel);
      if (entity) query.set("entity", entity);
      router.replace(`${basePath}?${query}`);
    },
    [basePath, router],
  );
  useEffect(() => {
    if (state.mode !== "write") return;
    let mounted = true;
    void storyworldSource
      .loadBranches(state.project.id)
      .then((result) => {
        const branch = result.branches.find(
          (item) => item.id === result.activeBranchId,
        );
        if (mounted)
          setActiveBranch(
            branch?.parentId ? { id: branch.id, name: branch.name } : null,
          );
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [state.mode, state.project.id, storyworldSource]);
  const setMode = useCallback(
    (mode: CanvasMode) => {
      dispatch({ type: "SET_MODE", mode }, false);
      setUrl(mode, panel);
    },
    [dispatch, panel, setUrl],
  );
  const openScene = useCallback(
    (id: string) => {
      dispatch({ type: "OPEN_SCENE", sceneId: id }, false);
      if (state.dataMode === "production")
        router.replace(
          `/studio/projects/${state.project.id}/chapters/${id}?mode=write`,
        );
      else setUrl("write");
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(".manuscript")?.focus(),
      );
    },
    [dispatch, router, setUrl, state.dataMode, state.project.id],
  );
  const openPanel = useCallback(
    (value: Panel) => {
      setPanel(value);
      if (value !== "create" && value !== "commands") setUrl(state.mode, value);
    },
    [setUrl, state.mode],
  );
  useEffect(() => {
    const mode = params.get("mode") as CanvasMode | null;
    if (
      mode &&
      ["write", "world", "branches"].includes(mode) &&
      mode !== state.mode
    )
      dispatch({ type: "SET_MODE", mode }, false);
    const next = params.get("panel") as Panel;
    if (next && ["library", "review", "settings", "sync"].includes(next))
      setPanel(next);
  }, [dispatch, params, state.mode]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPanel("commands");
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setPanel("create");
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "l"
      ) {
        event.preventDefault();
        openPanel("library");
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === "Enter" &&
        proposals.length
      ) {
        event.preventDefault();
        confirm(proposals.map((item) => item.id));
      }
      if (event.key === "Escape") {
        setPanel(null);
        if (!lensPinned) setLensId(null);
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });
  const analyze = useCallback(
    async (blocks: Array<{ id: string; text: string }>) => {
      if (!currentScene) return;
      try {
        const result = await dataSource.analyzeBlocks({
          projectId: state.project.id,
          sceneId: currentScene.id,
          revision: currentScene.revision,
          blocks,
        });
        analysis.current = result;
        dispatch({ type: "SET_PROPOSALS", proposals: result.proposals });
        setPulseExpanded(false);
        if (result.warning) setNotice(result.warning);
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Story Pulse could not analyze this change",
        );
      }
    },
    [currentScene, dataSource, dispatch, setNotice, state.project.id],
  );
  const confirm = async (ids: string[]) => {
    const run = analysis.current;
    if (!currentScene || !run) return;
    try {
      await dataSource.confirmProposals({
        projectId: state.project.id,
        sceneId: currentScene.id,
        runId: run.runId,
        proposalIds: ids,
        expectedRevision: run.revision,
        expectedCanonVersion: run.canonVersion,
        manuscriptHash: run.manuscriptHash,
      });
      dispatch({ type: "CONFIRM_PROPOSALS", ids });
      setPulseExpanded(false);
      setNotice("Story updated · Undo");
      setTimeout(() => setNotice(""), 8000);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Story facts could not be confirmed",
      );
    }
  };
  const openEntity = (id: string) => {
    setLensId(id);
    dispatch({ type: "SELECT_ENTITY", id }, false);
  };
  const addEntity = async (type: EntityType, name: string) => {
    if (!currentScene) return;
    const id = await createEntity({ name, type, sceneId: currentScene.id });
    setPanel(null);
    setLensId(id);
    setNotice(`${name} added · Undo`);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".manuscript")?.focus(),
    );
  };
  useEffect(() => {
    const merged = (event: Event) => {
      const scene = (event as CustomEvent<typeof currentScene>).detail;
      if (scene)
        dispatch(
          {
            type: "UPDATE_SCENE",
            sceneId: scene.id,
            manuscriptJson: scene.manuscriptJson,
            manuscriptText: scene.manuscriptText,
          },
          false,
        );
    };
    window.addEventListener("morrow:main-scene", merged);
    return () => window.removeEventListener("morrow:main-scene", merged);
  }, [dispatch]);
  const createWhatIf = async (selection: {
    sceneId: string;
    blockId: string;
    from: number;
    to: number;
    quote: string;
    snapshotSequence: number;
  }) => {
    if (state.dataMode === "demo") {
      try {
        const branch = await storyworldSource.createBranch({
          projectId: state.project.id,
          name: defaultBranchName(selection.quote),
          sceneId: selection.sceneId,
          sceneTitle: currentScene.title,
          evidence: selection.quote,
          blockId: selection.blockId,
          startOffset: selection.from,
          endOffset: selection.to,
          snapshotSequence: selection.snapshotSequence,
          forkManuscriptSequence: currentScene.order,
        });
        setActiveBranch({ id: branch.id, name: branch.name });
        setNotice(`Branch created: ${branch.name}`);
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : "The branch could not be created",
        );
      }
      return;
    }
    try {
      const checkpointResponse = await fetch(
        `/api/projects/${state.project.id}/scenes/${selection.sceneId}/checkpoint`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sequence: selection.snapshotSequence,
            source: "BRANCH_FORK",
          }),
        },
      );
      const checkpoint = await checkpointResponse.json();
      if (!checkpointResponse.ok)
        throw new Error(
          checkpoint.error?.message ??
            "The branch origin could not be preserved",
        );
      const quoteHash = Array.from(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(selection.quote),
          ),
        ),
      )
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
      const response = await fetch(
        `/api/projects/${state.project.id}/storyworld/branches`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: defaultBranchName(selection.quote),
            forkManuscriptSequence: currentScene.order,
            sceneId: selection.sceneId,
            checkpointId: checkpoint.checkpointId,
            initiatingEvidence: {
              sceneId: selection.sceneId,
              blockId: selection.blockId,
              startOffset: selection.from,
              endOffset: selection.to,
              exactQuote: selection.quote,
              quoteHash,
            },
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message ?? "The branch could not be created",
        );
      setActiveBranch({ id: result.branch.id, name: result.branch.name });
      setNotice(`Branch created: ${result.branch.name}`);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "The branch could not be created",
      );
    }
  };
  const command = (value: string) => {
    if (value === "Open Library") openPanel("library");
    else if (value === "Open Review") openPanel("review");
    else if (value === "Toggle Focus")
      dispatch({ type: "SET_FOCUS", focus: !state.focusMode });
    else if (value === "Reset demo") dispatch({ type: "RESET" });
    else if (value === "Create scene") setPanel("create");
    else if (value === "Create chapter") setPanel("create");
    else if (
      value === "Import Google Doc" ||
      value === "Sync Google Doc" ||
      value === "Connect Google"
    )
      setPanel("sync");
    else if (value.startsWith("entity:")) openEntity(value.slice(7));
    else if (value.startsWith("Create ")) setPanel("create");
  };
  const importPreview = async (preview: GoogleImportPreview) => {
    if (state.dataMode === "production") {
      const response = await fetch(
        `/api/projects/${state.project.id}/google/import/confirm`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(preview),
        },
      );
      const result = await response.json();
      if (!response.ok) return setNotice(result.error ?? "Import failed");
      const restored = await dataSource.loadProject(state.project.id);
      dispatch({ type: "RESTORE", state: restored });
      if (result.firstSceneId) openScene(result.firstSceneId);
      setNotice(
        `${result.chapters} chapters and ${result.scenes} scenes imported`,
      );
    } else {
      const merged = {
        ...state,
        project: {
          ...preview.project,
          id: state.project.id,
          title: state.project.title,
        },
        scenes: preview.project.scenes,
        currentSceneId: preview.project.scenes[0]?.id ?? "",
      };
      dispatch({ type: "RESTORE", state: merged });
      setNotice(
        `${preview.project.chapters.length} chapters imported into this demo`,
      );
    }
  };
  if (!currentScene)
    return (
      <div className="story-canvas empty-workspace">
        <StoryTopBar
          project={state.projectTitle}
          breadcrumb="Ready to begin"
          mode={state.mode}
          reviewCount={0}
          saveStatus={saveStatus}
          syncStatus={state.sync.status}
          focus={false}
          onMode={setMode}
          onCreate={() => setPanel("create")}
          onSync={() => setPanel("sync")}
          onLibrary={() => setPanel("library")}
          onReview={() => setPanel("review")}
          onSearch={() => setPanel("commands")}
          onSettings={() => setPanel("settings")}
          onExitFocus={() => {}}
        />
        <main>
          <h1>Your story is ready for its first chapter.</h1>
          <button onClick={() => setPanel("create")}>Create chapter</button>
          <button onClick={() => setPanel("sync")}>Import outline</button>
        </main>
        {panel === "create" && (
          <GlobalCreate
            chapters={state.project.chapters}
            onClose={() => setPanel(null)}
            onPart={(title) => void createPart({ title })}
            onChapter={(title) => void createChapter({ title })}
            onScene={(chapterId, title) =>
              void createScene({ chapterId, title })
            }
            onEntity={(type, name) => void addEntity(type, name)}
            onImport={() => setPanel("sync")}
          />
        )}
      </div>
    );
  return (
    <div
      className={`story-canvas mode-${state.mode} ${state.focusMode ? "focus" : ""} ${state.reducedMotion ? "reduce-motion" : ""}`}
    >
      <GooglePickerBridge
        onPick={() => setPanel("sync")}
        onError={(message) => setNotice(message)}
      />
      <StoryTopBar
        project={state.projectTitle}
        breadcrumb={`${currentChapter?.title ?? "Chapter"} / ${currentScene.title}`}
        mode={state.mode}
        reviewCount={openFindings.length}
        saveStatus={saveStatus}
        syncStatus={state.sync.status}
        focus={state.focusMode}
        onMode={setMode}
        onCreate={() => setPanel("create")}
        onSync={() => setPanel("sync")}
        onLibrary={() => openPanel("library")}
        onReview={() => openPanel("review")}
        onSearch={() => setPanel("commands")}
        onSettings={() => openPanel("settings")}
        onExitFocus={() => dispatch({ type: "SET_FOCUS", focus: false })}
      />
      <StoryTimeMachine
        projectId={state.project.id}
        activeBranchId={activeBranch?.id}
        source={storyworldSource}
        onBranch={setActiveBranch}
        onSequence={setStorySequence}
      />
      {state.mode === "write" && (
        <>
          <StoryOutline
            projectTitle={state.project.title}
            parts={state.project.parts}
            chapters={state.project.chapters}
            scenes={state.scenes}
            currentSceneId={currentScene.id}
            expanded={state.outlineExpanded && !state.focusMode}
            onToggle={() =>
              dispatch(
                { type: "SET_OUTLINE", expanded: !state.outlineExpanded },
                false,
              )
            }
            onOpen={openScene}
            onCreateChapter={(input) => void createChapter(input)}
            onCreateScene={(chapterId, title) =>
              void createScene({ chapterId, title })
            }
            onStructure={(command) => void structure(command)}
          />
          <div className="write-canvas">
            {activeBranch && (
              <div className="branch-indicator">
                <span role="status">MAIN</span>
                <strong>{activeBranch.name.toUpperCase()}</strong>
                <button
                  onClick={() => {
                    void storyworldSource.selectBranch("main");
                    setActiveBranch(null);
                  }}
                >
                  Return to Main
                </button>
              </div>
            )}
            <LivingEditor
              projectId={state.project.id}
              branchId={activeBranch?.id}
              production={state.dataMode === "production"}
              scene={currentScene}
              chapterTitle={currentChapter?.title ?? "Chapter"}
              entities={state.entities}
              observations={state.observations}
              pulseEnabled={state.pulseEnabled}
              textSize={state.textSize}
              onTitle={(title) =>
                void structure({
                  type: "rename-scene",
                  id: currentScene.id,
                  value: title,
                })
              }
              onChange={(manuscriptJson, manuscriptText) =>
                dispatch({
                  type: "UPDATE_SCENE",
                  sceneId: currentScene.id,
                  manuscriptJson,
                  manuscriptText,
                })
              }
              onAnalyze={analyze}
              onEntity={openEntity}
              onInlineCreate={(type, name) => addEntity(type, name)}
              onFocusMode={() =>
                dispatch({ type: "SET_FOCUS", focus: !state.focusMode }, false)
              }
              onWhatIf={(selection) => void createWhatIf(selection)}
            />
          </div>
          <StoryPulse
            proposals={proposals}
            impact={impact}
            expanded={pulseExpanded}
            onExpand={() => setPulseExpanded((value) => !value)}
            onConfirm={confirm}
            onDismiss={(id) => dispatch({ type: "DISMISS_PROPOSAL", id })}
            onReviewScene={openScene}
            onUndo={undo}
          />
        </>
      )}
      {state.mode === "world" && (
        <StoryMap
          projectId={state.project.id}
          branchId={activeBranch?.id ?? "main"}
          sequence={storySequence}
          source={storyworldSource}
          onOpen={openScene}
          onSelect={openEntity}
        />
      )}{" "}
      {state.mode === "branches" && (
        <StoryBranches
          projectId={state.project.id}
          currentSceneId={currentScene.id}
          source={storyworldSource}
          onOpenScene={openScene}
          onBranchSelect={setActiveBranch}
        />
      )}{" "}
      {lens && (
        <StoryLens
          entity={lens}
          scenes={state.scenes}
          observations={state.observations}
          pinned={lensPinned}
          onClose={() => setLensId(null)}
          onPin={() => setLensPinned((value) => !value)}
          onTrace={() => {
            dispatch({ type: "SET_MODE", mode: "world" }, false);
            setUrl("world", null, lens.id);
          }}
          onSource={openScene}
        />
      )}
      {panel === "create" && (
        <GlobalCreate
          currentChapter={currentChapter}
          chapters={state.project.chapters}
          onClose={() => setPanel(null)}
          onPart={(title) => void createPart({ title })}
          onChapter={(title) =>
            void createChapter({
              title,
              position: currentChapter
                ? currentChapter.position + 1
                : undefined,
            })
          }
          onScene={(chapterId, title) => void createScene({ chapterId, title })}
          onEntity={(type, name) => void addEntity(type, name)}
          onImport={() => setPanel("sync")}
        />
      )}{" "}
      {panel === "sync" && (
        <WorkspaceSync
          projectId={state.project.id}
          sync={state.sync}
          demo={state.dataMode === "demo"}
          onClose={() => setPanel(null)}
          onImport={(preview) => void importPreview(preview)}
          onSyncState={(sync) => dispatch({ type: "SET_SYNC", sync })}
        />
      )}{" "}
      {panel === "library" && (
        <StoryLibrary
          entities={state.entities}
          onClose={() => {
            setPanel(null);
            setUrl(state.mode);
          }}
          onOpen={(id) => {
            setPanel(null);
            openEntity(id);
          }}
          onCreate={(name, type) => void addEntity(type, name)}
        />
      )}{" "}
      {panel === "review" && (
        <ReviewDrawer
          findings={openFindings}
          index={reviewIndex}
          onClose={() => {
            setPanel(null);
            setUrl(state.mode);
          }}
          onNext={() =>
            setReviewIndex((value) =>
              openFindings.length ? (value + 1) % openFindings.length : 0,
            )
          }
          onDecide={(id, status) => {
            dispatch({ type: "DECIDE_FINDING", id, status });
            setReviewIndex(0);
          }}
          onSource={openScene}
        />
      )}{" "}
      {panel === "commands" && (
        <CommandPalette
          scenes={state.scenes}
          entities={state.entities}
          onClose={() => setPanel(null)}
          onMode={setMode}
          onScene={openScene}
          onCommand={command}
        />
      )}{" "}
      {panel === "settings" && (
        <SettingsPopover
          wordTarget={state.wordTarget}
          pulse={state.pulseEnabled}
          reducedMotion={state.reducedMotion}
          textSize={state.textSize}
          onSetting={(key, value) =>
            dispatch({ type: "SET_SETTING", key, value })
          }
          onReset={() => dispatch({ type: "RESET" })}
          onClose={() => {
            setPanel(null);
            setUrl(state.mode);
          }}
        />
      )}{" "}
      {notice && (
        <button
          className="canvas-toast"
          onClick={() => {
            if (notice.includes("Undo")) undo();
            setNotice("");
          }}
        >
          {notice}
        </button>
      )}
    </div>
  );
}
