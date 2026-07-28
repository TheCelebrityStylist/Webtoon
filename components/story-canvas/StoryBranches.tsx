"use client";

import { useEffect, useState } from "react";
import { GitBranch, ShieldAlert, SplitSquareHorizontal } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  parentId?: string;
  forkManuscriptSequence: number;
  status: "ACTIVE" | "MERGED" | "ARCHIVED";
  active: boolean;
  _count: { sceneOverrides: number; diagnostics: number };
};

export function StoryBranches({ projectId, currentSceneId, onOpenScene }: { projectId: string; currentSceneId: string; onOpenScene: (sceneId: string) => void }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    let active = true;
    void fetch(`/api/projects/${projectId}/storyworld/branches`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Branch history unavailable");
        return response.json() as Promise<{ branches: Branch[] }>;
      })
      .then((result) => { if (active) { setBranches(result.branches); setSelectedId(result.branches.find((branch) => branch.active)?.id ?? result.branches[0]?.id); setStatus("ready"); } })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [projectId]);
  const selected = branches.find((branch) => branch.id === selectedId);
  if (status === "loading") return <main className="story-branches"><p>Loading persisted branch history…</p></main>;
  if (status === "error") return <main className="story-branches"><ShieldAlert/><h2>Branch history could not be loaded.</h2><p>Your manuscript remains available. Reconnect before creating or merging a branch.</p></main>;
  return <main className="story-branches">
    <aside className="branch-tree" aria-label="Story branches">
      <header><GitBranch/><div><small>STORY HISTORIES</small><h2>Branches</h2></div></header>
      {branches.map((branch) => <button key={branch.id} aria-pressed={selectedId === branch.id} onClick={() => setSelectedId(branch.id)}>
        <GitBranch/><span><strong>{branch.name}</strong><small>Fork point {branch.forkManuscriptSequence} · {branch.status.toLowerCase()}</small></span>
        {branch._count.diagnostics > 0 && <b>{branch._count.diagnostics}</b>}
      </button>)}
    </aside>
    <section className="branch-timeline">
      <header><small>SELECTED HISTORY</small><h1>{selected?.name ?? "Main"}</h1><p>{selected?._count.sceneOverrides ?? 0} changed scenes · forked at story point {selected?.forkManuscriptSequence ?? 0}</p></header>
      <button className="branch-scene-change" onClick={() => onOpenScene(currentSceneId)}><SplitSquareHorizontal/><span><strong>Open current scene comparison</strong><small>Compare inherited Main prose with branch override.</small></span></button>
    </section>
    <aside className="branch-impact">
      <header><small>IMPACT & MERGE</small><h2>Verified consequences</h2></header>
      {selected?._count.diagnostics ? <p>{selected._count.diagnostics} consequences require review before merge.</p> : <p>No open deterministic consequences at the latest compiled story point.</p>}
      {selected?.name === "Main" ? <small>Create a branch from selected manuscript evidence to compare another supported future.</small> : <small>Repair tasks appear here after the branch compiler persists its diagnostics.</small>}
    </aside>
  </main>;
}
