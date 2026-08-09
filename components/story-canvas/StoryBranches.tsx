"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, GitBranch, RotateCcw, ShieldCheck, X } from "lucide-react";
import {
  DemoStoryworldDataSource,
  ProductionStoryworldDataSource,
  type BranchCollection,
  type BranchComparison,
  type MergePreview,
  type StoryworldDataSource,
} from "@/lib/storyworld/data-source";
import styles from "./styles/BranchWorkspace.module.css";

export function StoryBranches({
  projectId,
  currentSceneId,
  onOpenScene,
  source,
  onContinueWriting,
  onBranchSelect,
}: {
  projectId: string;
  currentSceneId: string;
  onOpenScene: (id: string) => void;
  source?: StoryworldDataSource;
  onContinueWriting?: () => void;
  onBranchSelect?: (branch: { id: string; name: string } | null) => void;
}) {
  const data = useMemo(
    () =>
      source ??
      (projectId === "museum-of-lost-hours"
        ? new DemoStoryworldDataSource(projectId)
        : new ProductionStoryworldDataSource(projectId)),
    [projectId, source],
  );
  const [collection, setCollection] = useState<BranchCollection>();
  const [selected, setSelected] = useState("main");
  const [comparison, setComparison] = useState<BranchComparison>();
  const [status, setStatus] = useState<
    "loading" | "ready" | "working" | "error"
  >("loading");
  const [notice, setNotice] = useState("");
  const [mergeId, setMergeId] = useState("");
  const [creating, setCreating] = useState(false);
  const [branchName, setBranchName] = useState("Untitled path");
  const [preview, setPreview] = useState<MergePreview>();
  const [selectedChanges, setSelectedChanges] = useState(new Set<string>());
  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await data.loadBranches(projectId);
      setCollection(result);
      setSelected((value) =>
        result.branches.some((item) => item.id === value)
          ? value
          : result.activeBranchId,
      );
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [data, projectId]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!collection) return;
    const branch = collection.branches.find((item) => item.id === selected);
    onBranchSelect?.(
      branch?.parentId ? { id: branch.id, name: branch.name } : null,
    );
    if (!branch?.parentId) {
      setComparison(undefined);
      return;
    }
    let active = true;
    void data
      .compareBranch(selected)
      .then((value) => {
        if (active) {
          setComparison(value);
          setSelectedChanges(
            new Set(
              value.changes
                .filter((change) => change.selected)
                .map((change) => change.id),
            ),
          );
        }
      })
      .catch(() => setStatus("error"));
    return () => {
      active = false;
    };
  }, [collection, data, onBranchSelect, selected]);
  useEffect(() => {
    if (!collection?.branches.some((branch) => branch.id === selected)) return;
    void data.selectBranch(selected);
  }, [collection?.branches, data, selected]);
  if (status === "loading" && !collection)
    return (
      <main className={styles.loading} data-testid="branches-workspace">
        <i />
        <i />
        <i />
        <p>Opening your story paths…</p>
      </main>
    );
  if (status === "error" && !collection)
    return (
      <main className={styles.error} data-testid="branches-workspace">
        <ShieldCheck />
        <h1>Your manuscript is safe.</h1>
        <p>Branch history is temporarily unavailable.</p>
        <div>
          <button onClick={() => void load()}>Retry</button>
          <button onClick={onContinueWriting}>Continue writing</button>
        </div>
      </main>
    );
  const branch = collection?.branches.find((item) => item.id === selected);
  const create = async () => {
    setStatus("working");
    try {
      const made = await data.createBranch({
        projectId,
        name: branchName.trim() || "Untitled path",
        sceneId: currentSceneId,
        sceneTitle: "Current scene",
      });
      await load();
      setSelected(made.id);
      setCreating(false);
      setNotice(`${made.name} created · Main is unchanged`);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "The branch could not be created",
      );
    }
    setStatus("ready");
  };
  const openPreview = async () => {
    if (!collection || !branch) return;
    setStatus("working");
    try {
      setPreview(
        await data.previewMerge({
          projectId,
          branchId: branch.id,
          changeIds: [...selectedChanges],
          expectedVersion: collection.version,
        }),
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Preview could not be prepared",
      );
    }
    setStatus("ready");
  };
  const cancelPreview = async () => {
    if (preview) await data.cancelMergePreview(preview.id);
    setPreview(undefined);
  };
  const merge = async () => {
    if (!collection || !branch) return;
    setStatus("working");
    try {
      const result = await data.mergeBranch({
        projectId,
        branchId: branch.id,
        changeIds: [...selectedChanges],
        expectedVersion: collection.version,
      });
      setMergeId(result.mergeId);
      setCollection({ ...collection, version: result.resultingVersion });
      setPreview(undefined);
      setNotice(result.message);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "The changes could not be merged.",
      );
    }
    setStatus("ready");
  };
  const undo = async () => {
    if (!collection || !mergeId) return;
    setStatus("working");
    const result = await data.revertMerge({
      projectId,
      mergeId,
      expectedVersion: collection.version,
    });
    setCollection({ ...collection, version: result.resultingVersion });
    setMergeId("");
    setNotice(result.message);
    setStatus("ready");
  };
  return (
    <main className={styles.workspace} data-testid="branches-workspace">
      <aside className={styles.tree}>
        <small>STORY PATHS</small>
        <h1>Branches</h1>
        <p>Explore changes without risking Main.</p>
        {collection?.branches.map((item) => (
          <button
            key={item.id}
            aria-pressed={selected === item.id}
            onClick={() => setSelected(item.id)}
          >
            <GitBranch />
            <span>
              <strong>{item.name}</strong>
              <small>
                {item.parentId
                  ? `${item.changedScenes} changed scene`
                  : "Source manuscript"}
              </small>
            </span>
            {item.openConsequences > 0 && <b>{item.openConsequences}</b>}
          </button>
        ))}
        <button className={styles.create} onClick={() => setCreating(true)}>
          ＋ Create a branch
        </button>
        {creating && (
          <div role="dialog" aria-label="Create a branch">
            <label>
              Branch name
              <input
                autoFocus
                value={branchName}
                onChange={(event) => setBranchName(event.target.value)}
              />
            </label>
            <label>
              <input type="checkbox" defaultChecked /> Fork from current scene
            </label>
            <button
              onClick={() => void create()}
              disabled={status === "working"}
            >
              Create branch
            </button>
            <button onClick={() => setCreating(false)}>Cancel</button>
          </div>
        )}
      </aside>
      <section className={styles.detail}>
        <header>
          <small>SELECTED PATH</small>
          <h2>{branch?.name}</h2>
          <p>
            {branch?.parentId
              ? `Forked from ${branch.forkSceneTitle ?? "The conversation room"}`
              : "The dependable source story."}
          </p>
        </header>
        <div className={styles.metrics}>
          <span>
            Changed<strong>{branch?.changedScenes ?? 0} scenes</strong>
          </span>
          <span>
            Verified effects<strong>{comparison?.changes.length ?? 0}</strong>
          </span>
          <span>
            Open repair tasks
            <strong>
              {comparison?.consequences.filter((item) => !item.resolved)
                .length ?? 0}
            </strong>
          </span>
        </div>
        <button
          className={styles.open}
          disabled={!branch?.parentId}
          onClick={() => {
            if (branch?.parentId) {
              onBranchSelect?.({ id: branch.id, name: branch.name });
              onOpenScene(branch.forkSceneId ?? currentSceneId);
            }
          }}
        >
          Open branch manuscript <ArrowRight />
        </button>
        {comparison ? (
          <div
            className={styles.compare}
            aria-label="Main and branch comparison"
          >
            <header>
              <span>MAIN</span>
              <span>{branch?.name.toUpperCase()}</span>
            </header>
            {comparison.mainManuscript || comparison.branchManuscript ? (
              <div>
                <blockquote>
                  {comparison.mainManuscript ?? comparison.changes[0]?.before}
                </blockquote>
                <blockquote>
                  {comparison.branchManuscript ?? comparison.changedSentence}
                </blockquote>
              </div>
            ) : (
              <blockquote>{comparison.changedSentence}</blockquote>
            )}
            {comparison.changes.map((change) => (
              <article key={change.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedChanges.has(change.id)}
                    onChange={() =>
                      setSelectedChanges((current) => {
                        const next = new Set(current);
                        if (next.has(change.id)) next.delete(change.id);
                        else next.add(change.id);
                        return next;
                      })
                    }
                  />
                  {change.title}
                </label>
                <p>
                  <del>{change.before}</del>
                  <ArrowRight />
                  <ins>{change.after}</ins>
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <ShieldCheck />
            <h3>Main is unchanged</h3>
            <p>
              Create or select a branch to compare another path with the source
              manuscript.
            </p>
          </div>
        )}
      </section>
      <aside className={styles.impact}>
        <small>STORY CONSEQUENCES</small>
        <h2>{comparison ? "What this changes" : "Main is dependable"}</h2>
        {comparison?.consequences.map((item) => (
          <article key={item.id}>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
            {item.sceneId && (
              <button onClick={() => onOpenScene(item.sceneId!)}>
                Open source
              </button>
            )}
          </article>
        ))}
        {comparison && (
          <button
            onClick={() => void openPreview()}
            disabled={status === "working" || !selectedChanges.size}
          >
            Preview merge
          </button>
        )}
        {mergeId && (
          <button onClick={() => void undo()}>
            <RotateCcw /> Undo merge
          </button>
        )}
        {notice && <p role="status">{notice}</p>}
      </aside>
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Merge preview"
          className={styles.preview}
        >
          <header>
            <div>
              <small>MERGE REVIEW</small>
              <h2>{branch?.name} → Main</h2>
            </div>
            <button
              aria-label="Cancel merge preview"
              onClick={() => void cancelPreview()}
            >
              <X />
            </button>
          </header>
          <p>Previewing this merge has not changed Main.</p>
          {preview.changes.map((change) => (
            <article key={change.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedChanges.has(change.id)}
                  onChange={() =>
                    setSelectedChanges((current) => {
                      const next = new Set(current);
                      if (next.has(change.id)) next.delete(change.id);
                      else next.add(change.id);
                      return next;
                    })
                  }
                />
                {change.title}
              </label>
              <div>
                <del>{change.before}</del>
                <ins>{change.after}</ins>
              </div>
            </article>
          ))}
          <footer>
            <button
              onClick={() => void merge()}
              disabled={!selectedChanges.size}
            >
              Merge selected
            </button>
            <button onClick={() => void cancelPreview()}>Keep Main</button>
            <button
              onClick={() => {
                void cancelPreview();
                onOpenScene(branch?.forkSceneId ?? currentSceneId);
              }}
            >
              Edit result
            </button>
            <button onClick={() => void cancelPreview()}>Cancel</button>
          </footer>
        </div>
      )}
    </main>
  );
}
