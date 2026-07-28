"use client";

import type { CanvasScene, StoryEntity, StoryObservation } from "@/lib/story-canvas/types";
import { StoryIcon } from "./StoryIcon";

export function StoryLens({ entity, scenes, observations, pinned, onClose, onPin, onTrace, onSource }: { entity: StoryEntity; scenes: CanvasScene[]; observations: StoryObservation[]; pinned: boolean; onClose: () => void; onPin: () => void; onTrace: () => void; onSource: (id: string) => void }) {
  const appearances = scenes.filter((scene) => entity.appearances.includes(scene.id));
  const facts = observations.filter((item) => item.subjectId === entity.id && item.status === "confirmed");
  const details = [
    ["Role", entity.role], ["Location", entity.currentLocation], ["Holder", entity.currentHolder],
    ["Owner", entity.currentOwner], ["State", entity.state], ["Atmosphere", entity.atmosphere], ["Description", entity.description],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));
  return <aside className={`story-lens ${entity.type}`} aria-label={`${entity.name} story lens`}><header><div><small>{entity.type} · current story point</small><h2>{entity.name}</h2></div><button onClick={onPin} aria-label={pinned ? "Unpin Lens" : "Pin Lens"}>{pinned ? "Pinned" : "Pin"}</button><button onClick={onClose} aria-label="Close Lens"><StoryIcon name="close"/></button></header><div className="lens-actions"><button onClick={onTrace}><StoryIcon name="trace"/>Trace through story</button></div><section><h3>Projected state <span>{entity.sourceCount ?? facts.length} sources</span></h3>{details.map(([label, value]) => <div className="lens-fact" key={label}><span><small>{label}</small><strong>{value}</strong></span></div>)}{!details.length && <p>No confirmed state exists at this story point.</p>}</section>{facts.length > 0 && <section><h3>Confirmed evidence</h3>{facts.map((fact) => <button className="lens-observation" key={fact.id} onClick={() => onSource(fact.sceneId)}><span>{fact.predicate}</span><strong>{fact.value}</strong><q>{fact.quote}</q><StoryIcon name="docs"/></button>)}</section>}<section><h3>Appearances <span>{appearances.length}</span></h3>{appearances.map((scene) => <button className="lens-appearance" key={scene.id} onClick={() => onSource(scene.id)}><span><strong>{scene.title}</strong><small>{scene.summary}</small></span><StoryIcon name="chevron"/></button>)}</section></aside>;
}
