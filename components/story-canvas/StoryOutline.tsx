"use client";

import { useEffect, useRef, useState } from "react";
import type { CanvasScene } from "@/lib/story-canvas/types";

const chapterName = (id: string) => id === "chapter-1" ? "The altered portrait" : id === "chapter-2" ? "The missing hours" : "The silver key";

export function StoryOutline({ scenes, currentSceneId, expanded, onToggle, onOpen, onCreate }: { scenes: CanvasScene[]; currentSceneId: string; expanded: boolean; onToggle: () => void; onOpen: (id: string) => void; onCreate: (title: string) => void }) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const initializedForViewport = useRef(false);
  useEffect(() => {
    if (initializedForViewport.current) return;
    initializedForViewport.current = true;
    if (expanded && window.matchMedia("(max-width: 600px)").matches) onToggle();
  }, [expanded, onToggle]);
  const submit = () => { if (!title.trim()) return; onCreate(title.trim()); setTitle(""); setCreating(false); };
  return <aside className={`story-outline ${expanded ? "expanded" : "collapsed"}`} aria-label="Story outline">
    <button className="outline-toggle" onClick={onToggle} aria-label={expanded ? "Collapse story outline" : "Expand story outline"}>☰</button>
    <div className="outline-scroll">{["chapter-1", "chapter-2", "chapter-3"].map((chapter, chapterIndex) => <section key={chapter}>
      <header><span>{chapterIndex + 1}</span><strong>{chapterName(chapter)}</strong></header>
      {scenes.filter((scene) => scene.chapterId === chapter).map((scene) => <button key={scene.id} className="outline-scene" aria-current={scene.id === currentSceneId ? "true" : undefined} onClick={() => onOpen(scene.id)}><i/><span>{scene.title}<small>{scene.content.trim().split(/\s+/).filter(Boolean).length} words</small></span><b aria-hidden="true">⠿</b></button>)}
    </section>)}</div>
    {creating ? <div className="inline-scene-create"><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); if (event.key === "Escape") setCreating(false); }} placeholder="Scene title" aria-label="New scene title"/><button onClick={submit}>Add</button></div> : <button className="outline-add" onClick={() => setCreating(true)} aria-label="Create scene">＋<span>New scene</span></button>}
  </aside>;
}
