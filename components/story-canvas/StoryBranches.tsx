"use client";

import { useCallback, useEffect, useState } from "react";
import { GitBranch, RotateCcw, ShieldAlert, SplitSquareHorizontal } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  parentId?: string;
  forkManuscriptSequence: number;
  status: "ACTIVE" | "MERGED" | "ARCHIVED";
  active: boolean;
  _count: { sceneOverrides: number; diagnostics: number };
};
type Difference = { id: string; kind: string; recordType: "EVENT" | "ENTITY_STATE" | "DIAGNOSTIC"; recordId: string };
type Diagnostic = { id: string; code: string; severity: string; message: string };
type Comparison = { differences: Difference[]; sceneChanges: Array<{ sceneId: string; baseSequence: number; branchSequence: number }>; summary: { events: number; scenes: number; entityStates: number; introducedRisks: number } };

export function StoryBranches({ projectId, currentSceneId, onOpenScene }: { projectId: string; currentSceneId: string; onOpenScene: (sceneId: string) => void }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [universeVersion, setUniverseVersion] = useState(0);
  const [comparison, setComparison] = useState<Comparison>();
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [eventIds, setEventIds] = useState<Set<string>>(new Set());
  const [sceneIds, setSceneIds] = useState<Set<string>>(new Set());
  const [mergeCommitId, setMergeCommitId] = useState<string>();
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "working" | "error">("loading");

  const loadBranches = useCallback(async () => {
    const response = await fetch(`/api/projects/${projectId}/storyworld/branches`);
    if (!response.ok) throw new Error("Branch history unavailable");
    const result = await response.json() as { branches: Branch[]; universeVersion: number };
    setBranches(result.branches);
    setUniverseVersion(result.universeVersion);
    setSelectedId((current) => current ?? result.branches.find((branch) => branch.active)?.id ?? result.branches[0]?.id);
  }, [projectId]);

  useEffect(() => {
    let active = true;
    void loadBranches().then(() => { if (active) setStatus("ready"); }).catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [loadBranches]);

  useEffect(() => {
    const selected = branches.find((branch) => branch.id === selectedId);
    if (!selected?.parentId) { setComparison(undefined); setDiagnostics([]); return; }
    let active = true;
    setStatus("loading");
    void Promise.all([
      fetch(`/api/projects/${projectId}/storyworld/branches/${selected.id}/compare`),
      fetch(`/api/projects/${projectId}/storyworld/branches/${selected.id}/diagnostics`),
    ]).then(async ([compareResponse, diagnosticResponse]) => {
      if (!compareResponse.ok || !diagnosticResponse.ok) throw new Error("Branch comparison unavailable");
      return Promise.all([compareResponse.json() as Promise<Comparison>, diagnosticResponse.json() as Promise<{ diagnostics: Diagnostic[] }>]);
    }).then(([compareResult, diagnosticResult]) => {
      if (!active) return;
      setComparison(compareResult);
      setDiagnostics(diagnosticResult.diagnostics);
      setEventIds(new Set(compareResult.differences.filter((difference) => difference.recordType === "EVENT" && difference.kind === "ADDED").map((difference) => difference.recordId)));
      setSceneIds(new Set(compareResult.sceneChanges.map((change) => change.sceneId)));
      setStatus("ready");
    }).catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [branches, projectId, selectedId]);

  const selected = branches.find((branch) => branch.id === selectedId);
  const toggle = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => setter((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const merge = async () => {
    if (!selected?.parentId) return;
    setStatus("working");
    setNotice("");
    const response = await fetch(`/api/projects/${projectId}/storyworld/branches/${selected.id}/merge`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedUniverseVersion: universeVersion, selectedChanges: { eventIds: [...eventIds], sceneIds: [...sceneIds] } }),
    });
    const result = await response.json() as { mergeCommitId?: string; resultingVersion?: number; error?: { message?: string } };
    if (!response.ok) { setNotice(result.error?.message ?? "The merge could not be applied."); setStatus("ready"); return; }
    setMergeCommitId(result.mergeCommitId);
    setUniverseVersion(result.resultingVersion ?? universeVersion + 1);
    setNotice("Selected changes merged as one reversible storyworld commit.");
    await loadBranches();
    setStatus("ready");
  };
  const undoMerge = async () => {
    if (!mergeCommitId) return;
    setStatus("working");
    const response = await fetch(`/api/projects/${projectId}/storyworld/commits/${mergeCommitId}/revert`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedUniverseVersion: universeVersion }),
    });
    const result = await response.json() as { resultingVersion?: number; error?: { message?: string } };
    if (!response.ok) { setNotice(result.error?.message ?? "The merge could not be undone."); setStatus("ready"); return; }
    setUniverseVersion(result.resultingVersion ?? universeVersion + 1);
    setMergeCommitId(undefined);
    setNotice("Merge undone. The source branch is still available.");
    await loadBranches();
    setStatus("ready");
  };

  if (status === "loading" && !branches.length) return <main className="story-branches"><p>Loading persisted branch history…</p></main>;
  if (status === "error" && !branches.length) return <main className="story-branches"><ShieldAlert/><h2>Branch history could not be loaded.</h2><p>Your manuscript remains available. Reconnect before creating or merging a branch.</p></main>;
  return <main className="story-branches">
    <aside className="branch-tree" aria-label="Story branches">
      <header><GitBranch/><div><small>STORY HISTORIES</small><h2>Branches</h2></div></header>
      {branches.map((branch) => <button key={branch.id} aria-pressed={selectedId === branch.id} onClick={() => setSelectedId(branch.id)}>
        <GitBranch/><span><strong>{branch.name}</strong><small>Fork point {branch.forkManuscriptSequence} · {branch.status.toLowerCase()}</small></span>
        {branch._count.diagnostics > 0 && <b>{branch._count.diagnostics}</b>}
      </button>)}
    </aside>
    <section className="branch-timeline">
      <header><small>SELECTED HISTORY</small><h1>{selected?.name ?? "Main"}</h1><p>{comparison ? `${comparison.summary.scenes} changed scenes · ${comparison.summary.events} event delta` : `${selected?._count.sceneOverrides ?? 0} changed scenes · forked at story point ${selected?.forkManuscriptSequence ?? 0}`}</p></header>
      <button className="branch-scene-change" onClick={() => onOpenScene(currentSceneId)}><SplitSquareHorizontal/><span><strong>Open current scene</strong><small>Continue writing in the selected branch document.</small></span></button>
      {comparison?.sceneChanges.map((change) => <label className="branch-change" key={change.sceneId}><input type="checkbox" checked={sceneIds.has(change.sceneId)} onChange={() => toggle(setSceneIds, change.sceneId)}/><span><strong>Scene manuscript change</strong><small>Checkpoint {change.baseSequence} → branch revision {change.branchSequence}</small></span><button type="button" onClick={() => onOpenScene(change.sceneId)}>Open</button></label>)}
      {comparison?.differences.filter((difference) => difference.recordType === "EVENT" && difference.kind === "ADDED").map((difference) => <label className="branch-change" key={difference.id}><input type="checkbox" checked={eventIds.has(difference.recordId)} onChange={() => toggle(setEventIds, difference.recordId)}/><span><strong>Canon event</strong><small>{difference.recordId}</small></span></label>)}
    </section>
    <aside className="branch-impact">
      <header><small>IMPACT & MERGE</small><h2>Verified consequences</h2></header>
      {diagnostics.length ? diagnostics.map((diagnostic) => <article key={diagnostic.id}><strong>{diagnostic.severity} · {diagnostic.code}</strong><p>{diagnostic.message}</p></article>) : <p>No open deterministic consequences at the latest compiled story point.</p>}
      {selected?.parentId && <button disabled={status === "working" || (!eventIds.size && !sceneIds.size)} onClick={() => void merge()}>Merge {eventIds.size + sceneIds.size} selected changes</button>}
      {mergeCommitId && <button onClick={() => void undoMerge()} disabled={status === "working"}><RotateCcw/> Undo last merge</button>}
      {notice && <p role="status">{notice}</p>}
      {!selected?.parentId && <small>Create a branch from selected manuscript evidence to compare another supported future.</small>}
    </aside>
  </main>;
}
