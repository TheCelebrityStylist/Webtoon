"use client";

import type { CanvasScene, StoryEntity, StoryObservation } from "@/lib/story-canvas/types";

export function StoryTrace({ entity, entities, scenes, observations, onSelect, onSource }: { entity: StoryEntity | null; entities: StoryEntity[]; scenes: CanvasScene[]; observations: StoryObservation[]; onSelect: (id: string) => void; onSource: (id: string) => void }) {
  if (!entity) return <main className="story-trace trace-picker"><p>Follow one element through the story.</p><input placeholder="Search people, places, objects, secrets…" aria-label="Search story elements"/><div>{entities.map((item) => <button key={item.id} onClick={() => onSelect(item.id)}><small>{item.type}</small>{item.name}</button>)}</div></main>;
  const appearances = scenes.filter((scene) => entity.appearances.includes(scene.id));
  const facts = observations.filter((item) => item.subjectId === entity.id && item.status === "confirmed");
  const keyRisk = entity.id === "silver-key" && entity.currentLocation === "River";
  return <main className="story-trace"><header><button onClick={() => onSelect("")}>← Choose another</button><small>{entity.type} trail</small><h1>{entity.name}</h1><p>Follow every supported state and appearance without leaving the story.</p></header><div className="trace-axis"><i/>{appearances.map((scene, index) => <button key={scene.id} className={keyRisk && scene.id === "archive-door" ? "at-risk" : ""} onClick={() => onSource(scene.id)} style={{ left: `${12 + index * (76 / Math.max(1, appearances.length - 1))}%` }}><span>{scene.chapterId.replace("chapter-", "Chapter ")}</span><strong>{scene.title}</strong><em>{scene.summary}</em>{keyRisk && scene.id === "archive-door" && <b>Potential conflict · key left in River</b>}</button>)}</div><section className="trace-state"><h2>State changes</h2>{facts.filter((fact) => fact.predicate !== "exists").map((fact) => <button key={fact.id} onClick={() => onSource(fact.sceneId)}><span>{fact.predicate}</span><strong>{fact.value}</strong><q>{fact.quote}</q></button>)}{!facts.some((fact) => fact.predicate !== "exists") && <p>Confirmed observations will appear along this trail.</p>}</section></main>;
}
