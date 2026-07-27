"use client";

import { useState } from "react";
import type { CanvasScene, StoryEntity, StoryObservation } from "@/lib/story-canvas/types";
import { StoryIcon } from "./StoryIcon";
import { useStoryCanvas } from "./hooks/useStoryCanvas";

export function StoryTrace({ entity, entities, scenes, observations, onSelect, onSource }: {
  entity: StoryEntity | null; entities: StoryEntity[]; scenes: CanvasScene[]; observations: StoryObservation[];
  onSelect: (id: string) => void; onSource: (id: string) => void;
}) {
  const { createEntity } = useStoryCanvas();
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const selected = entity ?? entities.find((item) => item.id === "silver-key") ?? entities[0] ?? null;
  if (!selected) return <main className="story-trace trace-picker"><StoryIcon name="trace"/><p>No confirmed journey yet.</p><button onClick={() => setCreating(true)}>Add an event</button></main>;
  const appearances = scenes.filter((scene) => selected.appearances.includes(scene.id));
  const facts = observations.filter((item) => item.subjectId === selected.id && item.status === "confirmed");
  const keyRisk = selected.id === "silver-key" && selected.currentLocation === "River";
  const pattern = new RegExp(selected.aliases.concat(selected.name).join("|"), "i");
  const trail = appearances.map((scene, index) => ({ scene, before: index === 0 ? "Not yet established" : index === 1 ? "Held by Lena" : selected.currentHolder ?? selected.currentLocation ?? "Tracked", after: scene.id === "conversation-room" ? "Held by Lena" : scene.id === "river-bank" ? "At the river" : scene.id === "archive-door" ? "Used at archive" : selected.state ?? "Observed", quote: scene.manuscriptText.split(/(?<=[.!?])\s/).find((sentence) => pattern.test(sentence)) ?? scene.manuscriptText }));
  const icon = selected.type === "person" ? "person" : selected.type === "place" ? "place" : selected.type === "object" ? "object" : "event";
  return <main className="story-trace commercial-trace">
    <header><div className={`trace-portrait ${selected.type}`}><StoryIcon name={icon}/></div><div><small>{selected.type} trail</small><h1>{selected.name}</h1><p>{selected.currentHolder ? `Currently held by ${selected.currentHolder}` : selected.currentLocation ? `Currently at ${selected.currentLocation}` : selected.state ?? "Follow every supported observation through the story."}</p></div><button onClick={() => setCreating(true)}><StoryIcon name="plus"/>Create related</button><label><StoryIcon name="search"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Choose another…"/>{search && <div>{entities.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).map((item) => <button key={item.id} onClick={() => { onSelect(item.id); setSearch(""); }}>{item.name}<small>{item.type}</small></button>)}</div>}</label></header>
    <section className="trace-trail"><i className="trace-guide"/>{trail.map((point, index) => <article key={point.scene.id} className={keyRisk && point.scene.id === "archive-door" ? "risk" : ""}><button className="trace-point" onClick={() => onSource(point.scene.id)}><span>{index + 1}</span></button><header><small>{point.scene.chapterId.replace("chapter-", "Chapter ")} · {point.scene.title}</small><strong>{index === 0 ? "Introduced" : point.after}</strong></header><blockquote>{point.quote}</blockquote><div><span><small>Before</small>{point.before}</span><StoryIcon name="chevron"/><span><small>After</small>{point.after}</span></div>{keyRisk && point.scene.id === "archive-door" && <aside><StoryIcon name="warning"/><span><strong>Continuity conflict</strong>Lena uses the key after it was left in the river.</span><button onClick={() => onSource(point.scene.id)}>Review scene</button></aside>}</article>)}</section>
    <footer><button onClick={() => setCreating(true)}><StoryIcon name="plus"/>Add event to this trail</button><span>{facts.length} confirmed state changes · {appearances.length} source scenes</span></footer>
    {creating && <div className="trace-create"><h2>Add an event for {selected.name}</h2><input autoFocus placeholder="What changes?" aria-label="Related event title" onKeyDown={async (event) => { if (event.key === "Enter" && event.currentTarget.value.trim()) { await createEntity({ name: event.currentTarget.value.trim(), type: "event", sceneId: scenes[0]?.id }); setCreating(false); } }}/><button onClick={() => setCreating(false)}>Cancel</button></div>}
  </main>;
}
