"use client";

import { useEffect, useMemo, useState } from "react";
import type { EntityType, StoryChapter } from "@/lib/story-canvas/types";
import { parseQuickCapture, type QuickCaptureKind } from "@/lib/storyworld/quick-capture";
import { StoryIcon } from "./StoryIcon";

const kinds: Array<{ kind: QuickCaptureKind; label: string }> = [
  { kind: "person", label: "Person" }, { kind: "place", label: "Place" }, { kind: "object", label: "Object" },
  { kind: "event", label: "Event" }, { kind: "faction", label: "Faction" }, { kind: "question", label: "Question" },
  { kind: "chapter", label: "Chapter" }, { kind: "scene", label: "Scene" }, { kind: "part", label: "Part" },
];

export function GlobalCreate({ currentChapter, chapters, onClose, onPart, onChapter, onScene, onEntity, onImport }: { currentChapter?: StoryChapter; chapters: StoryChapter[]; onClose: () => void; onPart: (title: string) => void; onChapter: (title: string) => void; onScene: (chapterId: string, title: string) => void; onEntity: (type: EntityType, name: string) => void; onImport: () => void }) {
  const [input, setInput] = useState("");
  const proposal = useMemo(() => parseQuickCapture(input), [input]);
  const [manualKind, setManualKind] = useState<QuickCaptureKind>();
  const [chapterId, setChapterId] = useState(currentChapter?.id ?? chapters[0]?.id ?? "");
  const kind = manualKind ?? proposal.kind;
  useEffect(() => { const close = (event: KeyboardEvent) => event.key === "Escape" && onClose(); addEventListener("keydown", close); return () => removeEventListener("keydown", close); }, [onClose]);
  const submit = () => {
    if (!input.trim()) return;
    if (kind === "part") onPart(proposal.title);
    else if (kind === "chapter") onChapter(proposal.title);
    else if (kind === "scene") onScene(chapterId, proposal.title);
    else onEntity(kind, proposal.title);
    onClose();
  };
  return <div className="canvas-backdrop create-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="create-dialog quick-capture" role="dialog" aria-modal="true" aria-label="Add anything to the story"><header><div><small>QUICK CAPTURE</small><h2>Add anything to the story…</h2></div><button onClick={onClose} aria-label="Close Quick Capture"><StoryIcon name="close"/></button></header><form onSubmit={(event) => { event.preventDefault(); submit(); }}><label className="capture-input">Story material<textarea autoFocus value={input} onChange={(event) => { setInput(event.target.value); setManualKind(undefined); }} placeholder="A person, place, object, event, question, chapter or scene…"/></label>{input.trim() && <section className="capture-proposal" aria-live="polite"><small>STRUCTURED PROPOSAL · LOCAL</small><strong>{proposal.title}</strong><span>{kind}</span><p>This proposal is deterministic. Confirming it creates a real project record.</p></section>}<fieldset><legend>Record type</legend>{kinds.map((item) => <button type="button" key={item.kind} aria-pressed={kind === item.kind} onClick={() => setManualKind(item.kind)}>{item.label}</button>)}</fieldset>{kind === "scene" && <label>Chapter<select value={chapterId} onChange={(event) => setChapterId(event.target.value)}>{chapters.filter((chapter) => chapter.status !== "archived").map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}</select></label>}<footer><button type="button" onClick={onImport}><StoryIcon name="drive"/>Import document</button><button className="primary" type="submit" disabled={!input.trim() || (kind === "scene" && !chapterId)}>Confirm {kind}</button></footer></form></section></div>;
}
