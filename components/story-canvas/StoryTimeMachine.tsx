"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import type { StoryworldDataSource } from "@/lib/storyworld/data-source";
import { useStoryCanvas } from "./hooks/useStoryCanvas";

export function StoryTimeMachine({
  projectId,
  activeBranchId,
  source: sourceOverride,
  onBranch,
  onSequence,
}: {
  projectId: string;
  activeBranchId?: string;
  source?: StoryworldDataSource;
  onBranch: (branch: { id: string; name: string } | null) => void;
  onSequence?: (sequence: number) => void;
}) {
  const { storyworldSource } = useStoryCanvas();
  const source = sourceOverride ?? storyworldSource;
  const [branches, setBranches] = useState<
    Array<{ id: string; name: string; active: boolean; parentId?: string }>
  >([]);
  const [sequence, setSequence] = useState(9);
  const [label, setLabel] = useState("Story point 9");
  const [available, setAvailable] = useState(true);
  const branchId =
    activeBranchId ?? branches.find((branch) => branch.active)?.id ?? "main";

  useEffect(() => {
    let active = true;
    void source
      .loadBranches(projectId)
      .then((result) => {
        if (!active) return;
        setBranches(result.branches);
      })
      .catch(() => setAvailable(false));
    return () => {
      active = false;
    };
  }, [projectId, source]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void source
        .loadStoryTime({ projectId, branchId, sequence })
        .then((result) => {
        setAvailable(true);
        setLabel(result.label);
        window.dispatchEvent(new CustomEvent("morrow:story-time", { detail: result }));
        onSequence?.(result.sequence);
        })
        .catch(() => setAvailable(false));
    }, 120);
    return () => window.clearTimeout(timeout);
  }, [branchId, onSequence, projectId, sequence, source]);

  const move = (value: number) => setSequence(Math.max(1, Math.min(9, value)));
  return (
    <footer className="story-time-machine" aria-label="Story Time Machine">
      <Clock3 aria-hidden="true" />
      <button
        onClick={() => move(sequence - 1)}
        disabled={sequence === 1}
        aria-label="Previous story point"
      >
        <ChevronLeft />
      </button>
      <label>
        <span>STORY TIME</span>
        <input
          type="range"
          min={1}
          max={9}
          value={sequence}
          onChange={(event) => move(Number(event.target.value))}
          aria-label="Story point"
        />
        <small>
          {available ? label : "Story state is still being prepared."}
        </small>
      </label>
      <button
        onClick={() => move(sequence + 1)}
        disabled={sequence === 9}
        aria-label="Next story point"
      >
        <ChevronRight />
      </button>
      <select
        aria-label="Story branch"
        value={branchId}
        onChange={(event) => {
          const branch = branches.find(
            (candidate) => candidate.id === event.target.value,
          );
          if (!branch) return;
          void source.selectBranch(branch.id);
          onBranch(
            branch.parentId ? { id: branch.id, name: branch.name } : null,
          );
        }}
      >
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
    </footer>
  );
}
