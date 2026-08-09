"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- OAuth and settings navigation must perform full document requests. */
import { useEffect, useState } from "react";
import type { GoogleImportPreview, GoogleWorkspaceState } from "@/lib/story-canvas/types";
import type { GoogleConflictDecision } from "@/lib/google/story-docs";
import type { HeadingInterpretation } from "@/lib/google/story-docs";
import { StoryIcon } from "./StoryIcon";

type View = "home" | "picker" | "preview" | "conflict";
export function WorkspaceSync({ projectId, sync, demo, onClose, onImport, onSyncState }: { projectId: string; sync: GoogleWorkspaceState; demo: boolean; onClose: () => void; onImport: (preview: GoogleImportPreview) => void; onSyncState: (next: Partial<GoogleWorkspaceState>) => void }) {
  const [view, setView] = useState<View>(sync.status === "conflict" ? "conflict" : "home");
  const [documentId, setDocumentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<GoogleImportPreview | null>(null);
  const [inspection, setInspection] = useState<{ title: string; wordCount: number; headings: number; namedRangeCount: number; empty: boolean; revisionId?: string } | null>(null);
  const [error, setError] = useState("");
  const [decisions, setDecisions] = useState<Record<string, GoogleConflictDecision>>({});
  const [interpretation, setInterpretation] = useState<HeadingInterpretation>({ heading1: "chapter", heading2: "scene", heading3: "scene", splitRules: true });
  const [replaceConfirmation, setReplaceConfirmation] = useState("");
  const connected = sync.status !== "not-connected";

  useEffect(() => {
    const picked = (event: Event) => {
      const file = (event as CustomEvent<{ id: string }>).detail;
      if (!file?.id) return;
      setDocumentId(file.id);
      setView("picker");
    };
    addEventListener("morrow:google-picked", picked);
    return () => removeEventListener("morrow:google-picked", picked);
  }, []);

  const request = async <T,>(path: string, body?: unknown): Promise<T> => {
    setBusy(true); setError("");
    try {
      const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Google Workspace request failed");
      return result as T;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Google Workspace request failed";
      setError(message); throw caught;
    } finally { setBusy(false); }
  };
  const loadPreview = async () => { const result = await request<GoogleImportPreview>(`/api/projects/${projectId}/google/import/preview`, { documentId, interpretation }); setPreview(result); setView("preview"); };
  const link = async (action: "create" | "link" | "replace") => { const result = await request<{ documentId: string; documentName: string; documentUrl: string; lastSyncedAt?: string; status: "synced" | "connected" }>(`/api/projects/${projectId}/google/link`, { action, documentId: action === "create" ? undefined : documentId, expectedRevision: action === "replace" ? inspection?.revisionId : undefined, confirmation: action === "replace" ? replaceConfirmation : undefined }); onSyncState({ ...result, status: result.status }); setInspection(null); setReplaceConfirmation(""); setView("home"); };
  const inspectLink = async () => { const result = await request<{ inspection: { title: string; wordCount: number; headings: number; namedRangeCount: number; empty: boolean; revisionId?: string } }>(`/api/projects/${projectId}/google/link`, { action: "inspect", documentId }); setInspection(result.inspection); };
  const syncNow = async () => { onSyncState({ status: "syncing" }); try { const result = await request<{ sync: Partial<GoogleWorkspaceState> }>(`/api/projects/${projectId}/google/sync`); onSyncState(result.sync); } catch { onSyncState({ status: "error" }); } };
  const workbook = async () => { const result = await request<{ workbookId: string; workbookUrl: string }>(`/api/projects/${projectId}/google/workbook`); onSyncState({ workbookId: result.workbookId }); window.open(result.workbookUrl, "_blank", "noopener,noreferrer"); };
  const choose = (sceneId: string, action: GoogleConflictDecision["action"], mergedText?: string) => setDecisions((current) => ({ ...current, [sceneId]: { sceneId, action, mergedText: mergedText ?? current[sceneId]?.mergedText } }));
  const chooseAll = (action: "KEEP_MORROW" | "USE_GOOGLE") => {
    if (!sync.externalChange) return;
    setDecisions(Object.fromEntries(sync.externalChange.scenes.map((scene) => [scene.sceneId, { sceneId: scene.sceneId, action }])));
  };
  const saveConflicts = async () => {
    if (!sync.externalChange) return;
    const selected = Object.values(decisions);
    if (!selected.length) return setError("Choose Keep Morrow, Use Google, Edit merged result, or Skip for each scene.");
    const result = await request<{ status: "synced" | "conflict"; revisionId: string }>(`/api/projects/${projectId}/google/conflicts/resolve`, { expectedGoogleRevision: sync.externalChange.googleRevision, decisions: selected });
    onSyncState({ status: result.status, latestRevisionId: result.revisionId, externalChange: result.status === "synced" ? undefined : sync.externalChange });
    if (result.status === "synced") setView("home");
  };
  const renameChapter = (chapterId: string, title: string) => setPreview((current) => current ? ({ ...current, project: { ...current.project, chapters: current.project.chapters.map((chapter) => chapter.id === chapterId ? { ...chapter, title } : chapter) } }) : current);
  const excludeChapter = (chapterId: string) => setPreview((current) => current ? ({ ...current, project: { ...current.project, chapters: current.project.chapters.filter((chapter) => chapter.id !== chapterId), scenes: current.project.scenes.filter((scene) => scene.chapterId !== chapterId) } }) : current);
  const keepChapterAsOneScene = (chapterId: string) => setPreview((current) => {
    if (!current) return current;
    const scenes = current.project.scenes.filter((scene) => scene.chapterId === chapterId).sort((a, b) => a.position - b.position);
    if (!scenes.length) return current;
    const manuscriptText = scenes.map((scene) => scene.manuscriptText).filter(Boolean).join("\n\n");
    const merged = { ...scenes[0], title: scenes[0].title || "Chapter", manuscriptText, content: manuscriptText, wordCount: manuscriptText.trim() ? manuscriptText.trim().split(/\s+/u).length : 0 };
    return { ...current, project: { ...current.project, scenes: [...current.project.scenes.filter((scene) => scene.chapterId !== chapterId), merged] } };
  });
  const mergeSceneWithPrevious = (sceneId: string) => setPreview((current) => {
    if (!current) return current;
    const scene = current.project.scenes.find((item) => item.id === sceneId);
    if (!scene) return current;
    const siblings = current.project.scenes.filter((item) => item.chapterId === scene.chapterId).sort((a, b) => a.position - b.position);
    const index = siblings.findIndex((item) => item.id === scene.id);
    if (index < 1) return current;
    const previous = siblings[index - 1];
    const manuscriptText = [previous.manuscriptText, scene.manuscriptText].filter(Boolean).join("\n\n");
    return { ...current, project: { ...current.project, scenes: current.project.scenes.filter((item) => item.id !== scene.id).map((item) => item.id === previous.id ? { ...item, manuscriptText, content: manuscriptText, wordCount: manuscriptText.trim().split(/\s+/u).length } : item) } };
  });

  return <div className="canvas-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="sync-dialog" role="dialog" aria-modal="true" aria-label="Workspace Sync">
    <header><div><small>Google Workspace</small><h2>Workspace Sync</h2></div><span className={`sync-badge ${sync.status}`}>{sync.status.replace("-", " ")}</span><button onClick={onClose} aria-label="Close Workspace Sync"><StoryIcon name="close" /></button></header>
    {error && <p className="sync-error" role="alert">{error}</p>}
    {view === "home" && (!connected ? <div className="sync-empty"><StoryIcon name="drive" /><h3>Bring your existing manuscript with you.</h3><p>Import a Google Doc or keep a reading copy synchronized without overwriting either version.</p><a className="primary" href={`/api/integrations/google/connect?service=docs&returnTo=${encodeURIComponent(location.pathname + location.search)}`}>Connect Google</a>{demo && <small>Demo session · connection requires an account</small>}</div> : <>
      <div className="sync-account"><span>{sync.accountEmail?.slice(0, 1).toUpperCase() ?? "G"}</span><div><strong>{sync.accountEmail ?? "Google connected"}</strong><small>{sync.grantedServices.length} granted services</small></div><a href="/studio/settings/integrations/google">Manage permissions</a></div>
      <div className="sync-grid"><article><StoryIcon name="docs" /><small>Linked document</small><strong>{sync.documentName ?? "No document linked"}</strong><span>{sync.lastSyncedAt ? `Last synced ${new Date(sync.lastSyncedAt).toLocaleString()}` : "Choose an existing Doc or create one"}</span>{sync.documentUrl && <a href={sync.documentUrl} target="_blank" rel="noreferrer">Open in Google <StoryIcon name="external" /></a>}</article><article><StoryIcon name="sheets" /><small>Story workbook</small><strong>{sync.workbookId ? "Workbook connected" : "Not created"}</strong><span>Chapters, scenes, entities, questions and continuity</span><button disabled={busy} onClick={() => void workbook()}>Create or refresh workbook</button></article><article><StoryIcon name="calendar" /><small>Writing Calendar</small><strong>Deadlines and sessions</strong><span>Calendar access is managed with your Google permissions.</span><a href="/studio/settings/integrations/google">Manage calendar</a></article></div>
      <footer><button onClick={() => setView("picker")}><StoryIcon name="drive" />Import or link a Doc</button><button disabled={busy} onClick={() => void link("create")}>Create reading copy</button><button className="primary" onClick={() => void syncNow()} disabled={busy || !sync.documentId}><StoryIcon name="sync" />{busy ? "Working…" : "Sync now"}</button></footer>
    </>)}
    {view === "picker" && <div className="picker-view"><button className="back" onClick={() => { setInspection(null); setView("home"); }}>Back</button><StoryIcon name="drive" /><h3>Choose a Google Doc</h3><p>Open the secure Google Picker. Selecting and inspecting a Doc never changes it.</p><button className="google-picker" onClick={() => window.dispatchEvent(new CustomEvent("morrow:google-picker"))}>Open Google Picker</button><label>Selected document<input value={documentId} onChange={(event) => { setDocumentId(event.target.value); setInspection(null); setReplaceConfirmation(""); }} placeholder="Choose a Doc or paste its ID" /></label>{inspection ? <section className="link-inspection"><h4>{inspection.title}</h4><p>{inspection.empty ? "Empty document" : `${inspection.wordCount} words`} · {inspection.headings} headings · {inspection.namedRangeCount} named ranges</p><small>Import and metadata-only linking do not change this Doc.</small><div className="replace-warning"><strong>Replace existing Google content</strong><p>This deletes the current Doc body and inserts the Morrow reading copy. Google revision {inspection.revisionId} is preserved as the recovery reference and checked again before writing.</p><label>Type REPLACE to confirm<input aria-label="Confirm Google document replacement" value={replaceConfirmation} onChange={(event) => setReplaceConfirmation(event.target.value)}/></label></div><div className="picker-actions"><button onClick={() => void loadPreview()}>Import document into Morrow</button><button disabled={busy || replaceConfirmation !== "REPLACE"} onClick={() => void link("replace")}>Replace Google document</button><button onClick={() => void link("create")}>Create a new Morrow copy</button><button className="primary" disabled={busy} onClick={() => void link("link")}>Link without changing Doc</button><button onClick={() => { setInspection(null); setDocumentId(""); setReplaceConfirmation(""); }}>Cancel</button></div></section> : <div className="picker-actions"><button disabled={documentId.length < 10 || busy} onClick={() => void loadPreview()}>{busy ? "Reading…" : "Preview import"}</button><button className="primary" disabled={documentId.length < 10 || busy} onClick={() => void inspectLink()}>Review document choices</button></div>}</div>}
    {view === "preview" && preview && <div className="import-preview"><button className="back" onClick={() => setView("picker")}>Back</button><h3>{preview.title}</h3><p>{preview.project.chapters.length} chapters · {preview.project.scenes.length} scenes detected. No project records are written until final confirmation.</p><section className="interpretation-controls"><label>Heading 1 means<select aria-label="Heading 1 interpretation" value={interpretation.heading1} onChange={(event) => setInterpretation((current) => ({ ...current, heading1: event.target.value as HeadingInterpretation["heading1"] }))}><option value="part">Part</option><option value="chapter">Chapter</option></select></label><label>Heading 2 means<select aria-label="Heading 2 interpretation" value={interpretation.heading2} onChange={(event) => setInterpretation((current) => ({ ...current, heading2: event.target.value as HeadingInterpretation["heading2"] }))}><option value="chapter">Chapter</option><option value="scene">Scene</option></select></label><label>Heading 3 means<select aria-label="Heading 3 interpretation" value="scene" disabled><option>Scene</option></select></label><label><input type="checkbox" checked={interpretation.splitRules} onChange={(event) => setInterpretation((current) => ({ ...current, splitRules: event.target.checked }))}/>Horizontal rule splits scenes</label><button disabled={busy} onClick={() => void loadPreview()}>Update interpretation</button></section><ol>{preview.project.chapters.map((chapter) => { const scenes = preview.project.scenes.filter((scene) => scene.chapterId === chapter.id).sort((a, b) => a.position - b.position); return <li key={chapter.id}><label>Chapter title<input aria-label={`Rename ${chapter.title}`} value={chapter.title} onChange={(event) => renameChapter(chapter.id, event.target.value)}/></label><span>{scenes.length} scenes</span><button onClick={() => keepChapterAsOneScene(chapter.id)}>Keep as one scene</button><button onClick={() => excludeChapter(chapter.id)}>Exclude section</button><ul>{scenes.map((scene, index) => <li key={scene.id}><span>{scene.title}</span>{index > 0 && <button onClick={() => mergeSceneWithPrevious(scene.id)}>Merge with previous</button>}</li>)}</ul></li>; })}</ol><footer><button onClick={() => setView("picker")}>Choose another</button><button className="primary" onClick={() => { onImport(preview); onClose(); }}>Confirm import</button></footer></div>}
    {view === "conflict" && sync.externalChange && <div className="conflict-review"><StoryIcon name="warning"/><h3>Both versions changed</h3><p>Nothing is overwritten until you approve each resolution. Google revision {sync.externalChange.googleRevision} will be checked again before saving.</p><div className="conflict-batch"><button onClick={() => chooseAll("KEEP_MORROW")}>Keep all Morrow</button><button onClick={() => chooseAll("USE_GOOGLE")}>Use all Google</button><button onClick={() => setDecisions({})}>Review individually</button></div>{sync.externalChange.scenes.map((scene) => { const decision = decisions[scene.sceneId]; return <article key={scene.sceneId}><h4>{scene.title}</h4><div><section><small>Current Morrow</small><p>{scene.morrow}</p></section><section><small>Google version</small><p>{scene.google}</p></section><section><small>Result</small><textarea aria-label={`Merged result for ${scene.title}`} value={decision?.mergedText ?? scene.morrow} onChange={(event) => choose(scene.sceneId, "MERGE", event.target.value)}/></section></div><footer><button aria-pressed={decision?.action === "KEEP_MORROW"} onClick={() => choose(scene.sceneId, "KEEP_MORROW")}>Keep Morrow</button><button aria-pressed={decision?.action === "USE_GOOGLE"} onClick={() => choose(scene.sceneId, "USE_GOOGLE")}>Use Google</button><button aria-pressed={decision?.action === "MERGE"} onClick={() => choose(scene.sceneId, "MERGE", decision?.mergedText ?? scene.morrow)}>Edit merged result</button><button aria-pressed={decision?.action === "SKIP"} onClick={() => choose(scene.sceneId, "SKIP")}>Skip for now</button></footer></article>; })}<footer><button onClick={onClose}>Cancel</button><button className="primary" disabled={busy || Object.keys(decisions).length === 0} onClick={() => void saveConflicts()}>{busy ? "Saving resolutions…" : "Save resolutions"}</button></footer></div>}
  </section></div>;
}
