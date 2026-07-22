"use client";

import { useMemo, useState } from "react";
import type { CanvasScene, StoryEntity } from "@/lib/story-canvas/types";

const threads = [
  { name: "The altered portrait", color: "#683e5c", scenes: ["portrait-gallery", "restored-portrait", "archive-door"] },
  { name: "The missing hours", color: "#356b57", scenes: ["west-hall", "missing-hour", "archive-door"] },
  { name: "The silver key", color: "#a96d2e", scenes: ["conversation-room", "river-bank", "archive-door"] },
];

export function StoryMap({ scenes, entities, currentSceneId, onOpen }: { scenes: CanvasScene[]; entities: StoryEntity[]; currentSceneId: string; onOpen: (id: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState("all");
  const visibleThreads = useMemo(() => filter === "all" ? threads : threads.filter((thread) => thread.scenes.some((id) => scenes.find((scene) => scene.id === id)?.people.includes(filter))), [filter, scenes]);
  return <main className="story-map" aria-label="Narrative map"><header><div><h1>Story map</h1><span>Reader order</span></div><div className="map-controls"><button onClick={() => setZoom((value) => Math.max(.65, value - .15))} aria-label="Zoom out">−</button><button onClick={() => setZoom(1)}>Fit story</button><button onClick={() => setZoom((value) => Math.min(1.4, value + .15))} aria-label="Zoom in">＋</button><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter map"><option value="all">All threads</option>{entities.filter((entity) => entity.type === "person").map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}</select></div></header><div className="map-viewport"><div className="map-plane" style={{ transform: `scale(${zoom})` }}><div className="chapter-bands">{["chapter-1", "chapter-2", "chapter-3"].map((chapter, index) => <section key={chapter}><span>Chapter {index + 1}</span></section>)}</div><svg className="thread-lines" viewBox="0 0 1500 520" preserveAspectRatio="none" aria-hidden="true">{visibleThreads.map((thread, lane) => { const points = thread.scenes.map((id) => scenes.find((scene) => scene.id === id)?.order ?? 0).map((order) => `${90 + order * 165},${140 + lane * 125}`).join(" "); return <polyline key={thread.name} points={points} fill="none" stroke={thread.color} strokeWidth="3"/>; })}<path d="M420 140 C650 30 930 30 1190 140" fill="none" stroke="#683e5c" strokeDasharray="7 7" strokeWidth="2"/></svg><div className="thread-labels">{visibleThreads.map((thread, lane) => <span key={thread.name} style={{ top: 116 + lane * 125, color: thread.color }}>{thread.name}</span>)}</div><div className="scene-nodes">{scenes.map((scene) => <button key={scene.id} className={scene.id === currentSceneId ? "current" : ""} style={{ left: 54 + scene.order * 165, top: 162 + (scene.order % 3) * 125 }} onClick={() => onOpen(scene.id)}><small>{scene.location}</small><strong>{scene.title}</strong><span>{scene.summary}</span></button>)}</div><div className="open-questions"><span>?</span><b>Who restored the portrait?</b><span>?</span><b>Why did every clock stop at 3:17?</b></div></div></div></main>;
}
