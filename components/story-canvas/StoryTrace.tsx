"use client";

import { useMemo, useState } from "react";
import type { CanvasScene, StoryEntity, StoryObservation } from "@/lib/story-canvas/types";
import { StoryIcon } from "./StoryIcon";

export function StoryTrace({ entity, entities, scenes, observations, onSelect, onSource }: { entity: StoryEntity | null; entities: StoryEntity[]; scenes: CanvasScene[]; observations: StoryObservation[]; onSelect: (id: string) => void; onSource: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const selected = entity ?? null;
  const matches = entities.filter((candidate) => candidate.name.toLowerCase().includes(query.toLowerCase()));
  const trail = useMemo(() => selected ? observations
    .filter((observation) => observation.subjectId === selected.id && observation.status === "confirmed")
    .sort((left, right) => scenes.findIndex((scene) => scene.id === left.sceneId) - scenes.findIndex((scene) => scene.id === right.sceneId)) : [], [observations, scenes, selected]);
  if (!selected) return <main className="story-trace trace-picker"><StoryIcon name="trace"/><p>Trace a confirmed story record.</p><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the Story Library" aria-label="Search records to trace"/><div>{matches.map((candidate) => <button key={candidate.id} onClick={() => onSelect(candidate.id)}><strong>{candidate.name}</strong><small>{candidate.type} · {candidate.appearances.length} appearances</small></button>)}</div></main>;
  return <main className="story-trace"><header><button onClick={() => onSelect("")}>Back to records</button><small>{selected.type} · projection trace</small><h1>{selected.name}</h1><p>Every state below comes from confirmed evidence. Manuscript and story order remain distinct.</p></header><section className="trace-state"><h2>Confirmed changes</h2>{trail.map((observation) => <button key={observation.id} onClick={() => onSource(observation.sceneId)}><span>{scenes.find((scene) => scene.id === observation.sceneId)?.title ?? "Source scene"}</span><strong>{observation.predicate}: {observation.value}</strong><q>{observation.quote}</q></button>)}{!trail.length && <p>No confirmed state transitions exist at this story point.</p>}</section></main>;
}
