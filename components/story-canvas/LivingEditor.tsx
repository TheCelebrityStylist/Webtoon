"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LocalDemoStoryAnalyzer, changedParagraphs } from "@/lib/story-canvas/local-analyzer";
import type { CanvasScene, StoryEntity, StoryObservation } from "@/lib/story-canvas/types";

const analyzer = new LocalDemoStoryAnalyzer();
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function decoratedHtml(text: string, entities: StoryEntity[], observations: StoryObservation[]) {
  const confirmedIds = new Set(observations.filter((item) => item.status === "confirmed").map((item) => item.subjectId));
  const confirmed = entities.filter((item) => confirmedIds.has(item.id));
  return text.split(/\n\s*\n/).map((paragraph) => {
    const candidates = confirmed.flatMap((entity) => [entity.name, ...entity.aliases].flatMap((name) => {
      const matches: Array<{ start: number; end: number; entity: StoryEntity }> = [];
      const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      for (const match of paragraph.matchAll(pattern)) if (match.index !== undefined) matches.push({ start: match.index, end: match.index + match[0].length, entity });
      return matches;
    })).sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    const accepted: typeof candidates = [];
    for (const candidate of candidates) if (!accepted.some((item) => candidate.start < item.end && candidate.end > item.start)) accepted.push(candidate);
    let cursor = 0;
    const parts: string[] = [];
    for (const match of accepted.sort((a, b) => a.start - b.start)) {
      parts.push(escapeHtml(paragraph.slice(cursor, match.start)));
      parts.push(`<button type="button" class="entity-decoration ${match.entity.type}" data-entity="${match.entity.id}">${escapeHtml(paragraph.slice(match.start, match.end))}</button>`);
      cursor = match.end;
    }
    parts.push(escapeHtml(paragraph.slice(cursor)));
    return `<p>${parts.join("")}</p>`;
  }).join("");
}

export function LivingEditor({ scene, entities, observations, pulseEnabled, textSize, onChange, onAnalyze, onEntity, onFocusMode }: { scene: CanvasScene; entities: StoryEntity[]; observations: StoryObservation[]; pulseEnabled: boolean; textSize: number; onChange: (content: string) => void; onAnalyze: (proposals: StoryObservation[]) => void; onEntity: (id: string) => void; onFocusMode: () => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previous = useRef(scene.content);
  const [draft, setDraft] = useState(scene.content);
  const [selectionMenu, setSelectionMenu] = useState<{ x: number; y: number } | null>(null);
  const hasDecorations = observations.some((item) => item.sceneId === scene.id && item.status === "confirmed");
  const html = useMemo(() => decoratedHtml(draft, entities, observations.filter((item) => item.sceneId === scene.id)), [draft, entities, observations, scene.id]);

  useEffect(() => {
    setDraft(scene.content);
    previous.current = scene.content;
    requestAnimationFrame(() => editorRef.current?.focus());
    // Scene content changes are handled by the editor input path; reset analysis only when navigation changes scenes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.id]);
  useEffect(() => {
    if (document.activeElement !== editorRef.current && scene.content !== draft) {
      setDraft(scene.content);
      previous.current = scene.content;
    }
  }, [draft, scene.content]);
  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.shiftKey && event.key.toLowerCase() === "f") { event.preventDefault(); onFocusMode(); } }; addEventListener("keydown", key); return () => removeEventListener("keydown", key); }, [onFocusMode]);
  useEffect(() => {
    if (!pulseEnabled || draft === previous.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const changed = changedParagraphs(previous.current, draft);
      previous.current = draft;
      const proposals = changed.flatMap((paragraph) => analyzer.analyze({ scene: { ...scene, content: draft }, paragraphId: paragraph.id, text: paragraph.text, entities }));
      if (proposals.length) onAnalyze(proposals);
    }, 1100);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [draft, entities, onAnalyze, pulseEnabled, scene]);

  const input = () => {
    const text = editorRef.current?.innerText.replace(/\n{3,}/g, "\n\n") ?? "";
    setDraft(text);
    onChange(text);
  };
  const selection = () => {
    const selected = window.getSelection();
    if (!selected || selected.isCollapsed || !selected.toString().trim()) return setSelectionMenu(null);
    const range = selected.getRangeAt(0).getBoundingClientRect();
    setSelectionMenu({ x: range.left + range.width / 2, y: range.top - 44 });
  };
  return <section className="living-editor"><header className="scene-heading"><span>{scene.chapterId.replace("chapter-", "Chapter ")} · {scene.location}</span><input value={scene.title} readOnly aria-label="Scene title"/><small>{draft.trim().split(/\s+/).filter(Boolean).length} words</small></header><div className="paper"><i className="paragraph-pulse" aria-hidden="true"/><div ref={editorRef} className={`manuscript ${hasDecorations ? "decorated" : ""}`} style={{ fontSize: textSize }} contentEditable suppressContentEditableWarning spellCheck onInput={input} onMouseUp={selection} onKeyUp={selection} onClick={(event) => { const target = (event.target as HTMLElement).closest<HTMLElement>("[data-entity]"); if (target?.dataset.entity) onEntity(target.dataset.entity); }} dangerouslySetInnerHTML={{ __html: html }}/></div>{selectionMenu && <div className="selection-menu" style={{ left: selectionMenu.x, top: selectionMenu.y }} role="toolbar" aria-label="Text selection actions"><button><b>B</b></button><button><i>I</i></button><button>Comment</button><button>Improve</button><button>＋ Person</button><button>＋ Place</button><button>＋ Object</button><button>Track fact</button></div>}<footer><span>Shift F · Focus</span><button aria-label="More editor commands">•••</button></footer></section>;
}
