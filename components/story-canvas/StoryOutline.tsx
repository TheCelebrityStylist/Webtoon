"use client";

import { useEffect, useRef, useState } from "react";
import type { CanvasScene, StoryChapter, StoryPart, StructureCommand } from "@/lib/story-canvas/types";
import { StoryIcon } from "./StoryIcon";
import styles from "./styles/StoryOutline.module.css";

type Creation = { type: "chapter" | "scene"; chapterId?: string; partId?: string; position?: number };

export function StoryOutline({ projectTitle, parts, chapters, scenes, currentSceneId, expanded, onToggle, onOpen, onCreateChapter, onCreateScene, onStructure }: {
  projectTitle: string;
  parts: StoryPart[];
  chapters: StoryChapter[];
  scenes: CanvasScene[];
  currentSceneId: string;
  expanded: boolean;
  onToggle: () => void;
  onOpen: (id: string) => void;
  onCreateChapter: (input?: { title?: string; partId?: string; position?: number }) => void;
  onCreateScene: (chapterId: string, title?: string) => void;
  onStructure: (command: Omit<StructureCommand, "projectId">) => void;
}) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState<Creation | null>(null);
  const [title, setTitle] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(chapters.filter((chapter) => chapter.collapsed).map((chapter) => chapter.id)));
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (expanded && matchMedia("(max-width: 600px)").matches) onToggle();
  }, [expanded, onToggle]);

  const submit = () => {
    const value = title.trim() || (creating?.type === "chapter" ? "Untitled chapter" : "Untitled scene");
    if (creating?.type === "chapter") onCreateChapter({ title: value, partId: creating.partId, position: creating.position });
    if (creating?.type === "scene" && creating.chapterId) onCreateScene(creating.chapterId, value);
    setCreating(null);
    setTitle("");
  };
  const submitRename = (chapter: StoryChapter) => {
    onStructure({ type: "rename-chapter", id: chapter.id, value: renameValue.trim() || chapter.title });
    setRenaming(null);
  };
  const toggleChapter = (id: string) => setCollapsed((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const visible = chapters.filter((chapter) => chapter.status !== "archived" && (!query || chapter.title.toLowerCase().includes(query.toLowerCase()) || scenes.some((scene) => scene.chapterId === chapter.id && scene.title.toLowerCase().includes(query.toLowerCase()))));

  const renderChapter = (chapter: StoryChapter, index: number) => {
    const chapterScenes = scenes.filter((scene) => scene.chapterId === chapter.id && scene.status !== "archived").sort((a, b) => a.position - b.position);
    const words = chapterScenes.reduce((total, scene) => total + scene.wordCount, 0);
    const isCollapsed = collapsed.has(chapter.id);
    return <section className="outline-chapter" key={chapter.id} data-chapter-id={chapter.id}>
      <button className="insert-chapter" aria-label={`Add chapter before ${chapter.title}`} onClick={() => setCreating({ type: "chapter", partId: chapter.partId, position: chapter.position })}><StoryIcon name="plus"/></button>
      <header>
        <button className="chapter-collapse" aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${chapter.title}`} aria-expanded={!isCollapsed} onClick={() => toggleChapter(chapter.id)}><StoryIcon name="chevron"/></button>
        <span className="chapter-number">{index + 1}</span>
        {renaming === chapter.id
          ? <input autoFocus className="chapter-title-input" value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onBlur={() => submitRename(chapter)} onKeyDown={(event) => { if (event.key === "Enter") submitRename(chapter); if (event.key === "Escape") setRenaming(null); }} aria-label={`Rename ${chapter.title}`}/>
          : <button className="chapter-title" onDoubleClick={() => { setRenameValue(chapter.title); setRenaming(chapter.id); }}>{chapter.title}<small>{words.toLocaleString()} words</small></button>}
        <button className="chapter-add" aria-label={`Add scene to ${chapter.title}`} onClick={() => setCreating({ type: "scene", chapterId: chapter.id })}><StoryIcon name="plus"/></button>
        <button className="chapter-more" aria-label={`${chapter.title} chapter menu`} onClick={() => setMenu(menu === chapter.id ? null : chapter.id)}><StoryIcon name="more"/></button>
        {menu === chapter.id && <div className="chapter-menu" role="menu">
          <button onClick={() => setCreating({ type: "scene", chapterId: chapter.id })}>Add scene</button>
          <button onClick={() => setCreating({ type: "chapter", partId: chapter.partId, position: chapter.position })}>Add chapter before</button>
          <button onClick={() => setCreating({ type: "chapter", partId: chapter.partId, position: chapter.position + 1 })}>Add chapter after</button>
          <button onClick={() => onStructure({ type: "move-chapter", id: chapter.id, direction: "earlier" })}>Move earlier</button>
          <button onClick={() => onStructure({ type: "move-chapter", id: chapter.id, direction: "later" })}>Move later</button>
          <button onClick={() => onStructure({ type: "duplicate-chapter", id: chapter.id })}>Duplicate</button>
          <button onClick={() => onStructure({ type: "archive-chapter", id: chapter.id })}>Archive</button>
          <button className="danger" onClick={() => { setDeleting(chapter.id); setMenu(null); }}>Delete…</button>
        </div>}
      </header>
      {!isCollapsed && chapterScenes.map((scene) => <button key={scene.id} className="outline-scene" aria-current={scene.id === currentSceneId ? "true" : undefined} onClick={() => onOpen(scene.id)} draggable onDragStart={(event) => event.dataTransfer.setData("text/morrow-scene", scene.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData("text/morrow-scene"); if (id) onStructure({ type: "move-scene", id, targetId: chapter.id, position: scene.position }); }}><StoryIcon name="drag"/><i/><span>{scene.title}<small>{scene.wordCount} words</small></span><b aria-hidden="true">{scene.objects.length + scene.people.length || ""}</b></button>)}
      {deleting === chapter.id && <div className="inline-delete-confirm" role="alertdialog" aria-labelledby={`delete-${chapter.id}`}>
        <strong id={`delete-${chapter.id}`}>Delete “{chapter.title}” and its scenes?</strong>
        <button onClick={() => setDeleting(null)}>Cancel</button>
        <button className="danger" onClick={() => { onStructure({ type: "delete-chapter", id: chapter.id }); setDeleting(null); }}>Delete chapter</button>
      </div>}
    </section>;
  };

  return <aside className={`${styles.outline} story-outline ${expanded ? "expanded" : "collapsed"}`} aria-label="Story outline">
    <header className="outline-header"><div><small>Manuscript</small><strong>{projectTitle}</strong></div><button onClick={onToggle} aria-label={expanded ? "Collapse story outline" : "Expand story outline"}><StoryIcon name="menu"/></button><button aria-label="Create chapter" onClick={() => setCreating({ type: "chapter" })}><StoryIcon name="plus"/></button></header>
    {expanded && <><label className="outline-search"><StoryIcon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter chapters and scenes" aria-label="Filter manuscript"/></label><div className="outline-scroll">{parts.filter((part) => part.status !== "archived").map((part) => <section className="outline-part" key={part.id}><header><span>{part.title}</span><small>{Math.round((part.chapterIds.length / Math.max(1, chapters.length)) * 100)}%</small><button aria-label={`Add chapter to ${part.title}`} onClick={() => setCreating({ type: "chapter", partId: part.id })}><StoryIcon name="plus"/></button></header>{visible.filter((chapter) => chapter.partId === part.id).map(renderChapter)}</section>)}{visible.filter((chapter) => !chapter.partId).map(renderChapter)}{!visible.length && <div className="outline-empty"><StoryIcon name="chapter"/><strong>Your story is ready for its first chapter.</strong><button onClick={() => setCreating({ type: "chapter" })}>Create chapter</button></div>}</div><button className="outline-add" onClick={() => setCreating({ type: "chapter" })}><StoryIcon name="plus"/><span>New chapter</span></button></>}
    {creating && <div className="inline-structure-create"><StoryIcon name={creating.type === "chapter" ? "chapter" : "scene"}/><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); if (event.key === "Escape") setCreating(null); }} placeholder={creating.type === "chapter" ? "Untitled chapter" : "Untitled scene"} aria-label={`New ${creating.type} title`}/><button onClick={submit}>Create</button></div>}
  </aside>;
}
