"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

type Point = { atManuscriptSequence: number; sourceCommitId: string };
type Branch = { id: string; name: string; active: boolean };

export function StoryTimeMachine({ projectId, activeBranchId, onBranch }: { projectId: string; activeBranchId?: string; onBranch: (branch: { id: string; name: string } | null) => void }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [index, setIndex] = useState(0);
  const branchId = activeBranchId ?? branches.find((branch) => branch.active)?.id ?? branches[0]?.id;
  useEffect(() => {
    let active = true;
    void fetch(`/api/projects/${projectId}/storyworld/branches`).then((response) => response.json()).then((result: { branches?: Branch[] }) => { if (active) setBranches(result.branches ?? []); });
    return () => { active = false; };
  }, [projectId]);
  useEffect(() => {
    if (!branchId) return;
    let active = true;
    void fetch(`/api/projects/${projectId}/storyworld/time?branchId=${encodeURIComponent(branchId)}`).then((response) => response.json()).then((result: { points?: Point[] }) => { if (active) { setPoints(result.points ?? []); setIndex(Math.max(0, (result.points?.length ?? 1) - 1)); } });
    return () => { active = false; };
  }, [branchId, projectId]);
  const point = points[index];
  return <footer className="story-time-machine" aria-label="Story Time Machine"><Clock3 aria-hidden="true"/><button onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} aria-label="Previous story point"><ChevronLeft/></button><label><span>STORY TIME</span><input type="range" min={0} max={Math.max(0, points.length - 1)} value={index} onChange={(event) => setIndex(Number(event.target.value))} aria-label="Story point"/><small>{point ? `Point ${point.atManuscriptSequence}` : "No compiled points"}</small></label><button onClick={() => setIndex((value) => Math.min(points.length - 1, value + 1))} disabled={!points.length || index >= points.length - 1} aria-label="Next story point"><ChevronRight/></button><select aria-label="Story branch" value={branchId ?? ""} onChange={(event) => { const branch = branches.find((candidate) => candidate.id === event.target.value); onBranch(branch ? { id: branch.id, name: branch.name } : null); }}><option value="" disabled>Choose branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></footer>;
}
