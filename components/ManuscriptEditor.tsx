"use client";

import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { storyDecorationKey, StableBlockIds, StoryDecorations, type StoryDecoration } from "@/lib/editor/story-extensions";
import { createDraft, deleteDraft, getDraft, putDraft, retryDelay, type ManuscriptDraft } from "@/lib/persistence/manuscript";

type Document = Record<string, unknown>;
type Proposal = {
  id: string;
  kind: "ENTITY" | "TRANSITION" | "EVENT" | "MENTION" | "WARNING";
  entityType?: "CHARACTER" | "PLACE" | "OBJECT" | "EVENT";
  entityName?: string;
  property?: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  confidence: number;
  evidence: { blockId: string; quote: string; startOffset: number; endOffset: number };
};
type PulseResult = { runId: string; canonVersion: number; manuscriptHash: string; revision: number; proposals: Proposal[]; warnings: string[] };
type SaveState = "cloud" | "local" | "syncing" | "offline" | "conflict" | "failed";

const saveLabels: Record<SaveState, string> = {
  cloud: "Saved to cloud",
  local: "Saved locally",
  syncing: "Saved locally · syncing",
  offline: "Saved locally · waiting to sync",
  conflict: "Conflict · local writing protected",
  failed: "Save failed · local writing protected",
};

async function sha256(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function ManuscriptEditor({ projectId, sceneId, sceneTitle, projectTitle, initialDocument, initialRevision }: {
  projectId: string;
  sceneId: string;
  sceneTitle: string;
  projectTitle: string;
  initialDocument: Document;
  initialRevision: number;
}) {
  const revision = useRef(initialRevision);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<ManuscriptDraft | null>(null);
  const syncing = useRef(false);
  const request = useRef<AbortController | null>(null);
  const confirmRef = useRef<() => Promise<void>>(async () => undefined);
  const analyzedBlocks = useRef(new Map<string, string>());
  const previousText = useRef("");
  const [saveState, setSaveState] = useState<SaveState>("cloud");
  const [pulse, setPulse] = useState<PulseResult | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [trayOpen, setTrayOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [lens, setLens] = useState<Proposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const sync = useCallback(async (draft?: ManuscriptDraft) => {
    const queued = draft ?? latest.current;
    if (!queued || syncing.current) return;
    if (!navigator.onLine) return setSaveState("offline");
    syncing.current = true;
    setSaveState("syncing");
    try {
      const response = await fetch(`/api/projects/${projectId}/scenes/${sceneId}`, {
        method: "PUT",
        headers: { "content-type": "application/json", "x-morrow-mutation-id": `${queued.key}:${queued.updatedAt}` },
        body: JSON.stringify({ revision: revision.current, document: queued.document, text: queued.text }),
      });
      const body = await response.json() as { revision?: number };
      if (response.status === 409) return setSaveState("conflict");
      if (!response.ok) throw new Error("Cloud save failed");
      revision.current = body.revision ?? revision.current + 1;
      latest.current = null;
      await deleteDraft(projectId, sceneId);
      setSaveState("cloud");
    } catch {
      const failed = { ...queued, syncState: "failed" as const, attempts: queued.attempts + 1 };
      latest.current = failed;
      await putDraft(failed).catch(() => undefined);
      setSaveState(navigator.onLine ? "failed" : "offline");
      saveTimer.current = setTimeout(() => void sync(failed), retryDelay(failed.attempts));
    } finally {
      syncing.current = false;
    }
  }, [projectId, sceneId]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, StableBlockIds, StoryDecorations],
    content: initialDocument,
    onUpdate: ({ editor: activeEditor, transaction }) => {
      const text = activeEditor.getText();
      const draft = createDraft(projectId, sceneId, revision.current, activeEditor.getJSON(), text);
      latest.current = draft;
      void putDraft(draft).then(() => setSaveState(navigator.onLine ? "local" : "offline")).catch(() => setSaveState("failed"));
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void sync(draft), 900);
      if (!transaction.docChanged || text === previousText.current) return;
      previousText.current = text;
      if (analysisTimer.current) clearTimeout(analysisTimer.current);
      analysisTimer.current = setTimeout(() => void analyzeChangedBlocks(activeEditor.getText()), 1200);
    },
  });

  async function analyzeChangedBlocks(fullText: string) {
    if (!editor || !latest.current) return;
    const blocks: Array<{ id: string; text: string; adjacent: string[]; title: string; order: number }> = [];
    const all: Array<{ id: string; text: string }> = [];
    editor.state.doc.descendants((node) => {
      if (node.isTextblock) all.push({ id: node.attrs.blockId as string, text: node.textContent });
    });
    all.forEach((block, order) => {
      const normalized = block.text.replace(/\s+/g, " ").trim();
      if (normalized.split(" ").filter(Boolean).length < 3 || analyzedBlocks.current.get(block.id) === normalized) return;
      blocks.push({ ...block, adjacent: [all[order - 1]?.text, all[order + 1]?.text].filter(Boolean), title: sceneTitle, order });
    });
    if (!blocks.length) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const manuscriptHash = await sha256(fullText);
    const requestId = crypto.randomUUID();
    try {
      const response = await fetch(`/api/projects/${projectId}/scenes/${sceneId}/story-pulse`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ projectId, sceneId, revision: revision.current, requestId, manuscriptHash, blocks, candidateEntities: [], confirmedFacts: [] }),
      });
      const result = await response.json() as PulseResult & { error?: string };
      if (!response.ok) {
        if (response.status !== 409) setNotice(result.error ?? "Story Pulse could not analyze this change");
        return;
      }
      if (request.current !== controller) return;
      blocks.forEach((block) => analyzedBlocks.current.set(block.id, block.text.replace(/\s+/g, " ").trim()));
      setPulse(result);
      setSelected(result.proposals.map((proposal) => proposal.id));
      setTrayOpen(true);
      const decorations: StoryDecoration[] = result.proposals.filter((proposal) => proposal.entityType).map((proposal) => ({ blockId: proposal.evidence.blockId, from: proposal.evidence.startOffset, to: proposal.evidence.endOffset, entityType: proposal.entityType!, label: proposal.entityName ?? proposal.kind }));
      editor.view.dispatch(editor.state.tr.setMeta(storyDecorationKey, decorations));
    } catch (error) {
      if ((error as Error).name !== "AbortError") setNotice("Story Pulse is temporarily unavailable; your writing is still saved locally.");
    }
  }

  async function confirm() {
    if (!pulse || !selected.length) return;
    setBusy(true);
    const response = await fetch(`/api/projects/${projectId}/scenes/${sceneId}/story-pulse/${pulse.runId}/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ revision: pulse.revision, manuscriptHash: pulse.manuscriptHash, expectedVersion: pulse.canonVersion, proposalIds: selected }),
    });
    const result = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) return setNotice(result.error === "STALE_REVISION" ? "The manuscript changed. Review the newest Story Pulse before confirming." : result.error ?? "Confirmation failed");
    setNotice(`${selected.length} story records confirmed`);
    setPulse(null);
    setTrayOpen(false);
  }
  confirmRef.current = confirm;

  useEffect(() => {
    if (!editor) return;
    previousText.current = editor.getText();
    void getDraft(projectId, sceneId).then((draft) => {
      if (draft && draft.baseRevision >= initialRevision && draft.text !== editor.getText()) {
        editor.commands.setContent(draft.document, false);
        latest.current = draft;
        setSaveState("local");
      }
    });
    const keys = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "p") { event.preventDefault(); setTrayOpen(true); }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && trayOpen) { event.preventDefault(); void confirmRef.current(); }
      if (event.key === "Escape") { setLibraryOpen(false); setLens(null); setTrayOpen(false); }
    };
    addEventListener("keydown", keys);
    return () => { removeEventListener("keydown", keys); request.current?.abort(); if (saveTimer.current) clearTimeout(saveTimer.current); if (analysisTimer.current) clearTimeout(analysisTimer.current); };
  }, [editor, initialRevision, projectId, sceneId, trayOpen]);

  if (!editor) return <div className="story-loading">Opening your manuscript…</div>;
  const words = editor.getText().trim().split(/\s+/).filter(Boolean).length;
  return <div className="living-manuscript">
    <header className="story-topbar">
      <button className="icon-button" aria-label="Toggle outline">☰</button>
      <span className="story-project">{projectTitle}</span><span className="breadcrumb">/</span>
      <input aria-label="Scene title" value={sceneTitle} readOnly />
      <div className="story-top-actions"><button onClick={() => setLibraryOpen(true)}>Search</button><button onClick={() => setLibraryOpen(true)}>Library</button><span role="status">{saveLabels[saveState]}</span><button onClick={() => setTrayOpen(true)}>Pulse{pulse ? ` ${pulse.proposals.length}` : ""}</button><button className="avatar" aria-label="Profile">E</button></div>
    </header>
    <aside className="story-outline"><h2>Outline</h2><p className="active-scene">{sceneTitle}</p><button>+ New scene</button></aside>
    <main className="story-prose"><div className="prose-tools"><button onClick={() => editor.chain().focus().toggleBold().run()}>B</button><button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button></div><EditorContent editor={editor} /><footer>{words} words</footer></main>
    {lens && <aside className="story-lens"><button onClick={() => setLens(null)} aria-label="Close lens">×</button><small>{lens.entityType}</small><h2>{lens.entityName}</h2><h3>State here</h3><p>{lens.property ? `${lens.property}: ${String(lens.afterValue ?? "unresolved")}` : "First appears in this scene."}</p><h3>Source</h3><button className="source-link" onClick={() => editor.commands.focus()}>&ldquo;{lens.evidence.quote}&rdquo;</button></aside>}
    <section className={`pulse-tray ${trayOpen ? "open" : ""}`} aria-label="Story Pulse" aria-live="polite"><header><button onClick={() => setTrayOpen((value) => !value)}><b>Story Pulse</b>{pulse ? ` · ${pulse.proposals.length} suggestions` : ""}</button><span>⌘⇧P</span></header>{trayOpen && <div className="pulse-content">{pulse ? <><div className="pulse-list">{pulse.proposals.map((proposal) => <label key={proposal.id} className={proposal.kind === "WARNING" ? "reality-changed" : ""}><input type="checkbox" checked={selected.includes(proposal.id)} onChange={() => setSelected((value) => value.includes(proposal.id) ? value.filter((id) => id !== proposal.id) : [...value, proposal.id])}/><span><small>{proposal.kind === "WARNING" ? "Reality changed" : proposal.entityType ?? proposal.kind}</small><b>{proposal.entityName}{proposal.property ? ` · ${proposal.property}` : ""}</b><q>{proposal.evidence.quote}</q></span><button type="button" onClick={() => setLens(proposal)}>Open lens</button></label>)}</div><div className="pulse-actions"><button className="primary" disabled={busy || !selected.length} onClick={() => void confirm()}>{busy ? "Confirming…" : `Confirm ${selected.length}`}</button><button onClick={() => { setPulse(null); setTrayOpen(false); }}>Keep previous canon</button><button onClick={() => setTrayOpen(false)}>Review later</button></div></> : <p>Keep writing. Changes are analyzed after a quiet moment.</p>}{pulse?.warnings.map((warning) => <p className="provider-note" key={warning}>{warning}</p>)}</div>}</section>
    {libraryOpen && <div className="library-backdrop" role="presentation"><section className="story-library" role="dialog" aria-modal="true" aria-label="Story Library"><header><h2>Story Library</h2><button onClick={() => setLibraryOpen(false)}>×</button></header><input autoFocus placeholder="Search people, places, objects, events…" aria-label="Search story library"/><nav><button>All</button><button>People</button><button>Places</button><button>Objects</button><button>Events</button></nav><div className="library-empty"><p>Your confirmed story records will appear here.</p><button>+ Quick create</button></div></section></div>}
    {notice && <button className="story-toast" onClick={() => setNotice(null)}>{notice}</button>}
  </div>;
}
