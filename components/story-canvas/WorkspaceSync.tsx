"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- OAuth and settings navigation must perform full document requests. */
import { useEffect, useState } from "react";
import type { GoogleImportPreview, GoogleWorkspaceState } from "@/lib/story-canvas/types";
import { StoryIcon } from "./StoryIcon";

type View = "home" | "picker" | "preview" | "conflict";
export function WorkspaceSync({ projectId, sync, demo, onClose, onImport, onSyncState }: { projectId: string; sync: GoogleWorkspaceState; demo: boolean; onClose: () => void; onImport: (preview: GoogleImportPreview) => void; onSyncState: (next: Partial<GoogleWorkspaceState>) => void }) {
  const [view, setView] = useState<View>(sync.status === "conflict" ? "conflict" : "home");
  const [documentId, setDocumentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<GoogleImportPreview | null>(null);
  const [error, setError] = useState("");
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
  const loadPreview = async () => { const result = await request<GoogleImportPreview>(`/api/projects/${projectId}/google/import/preview`, { documentId }); setPreview(result); setView("preview"); };
  const link = async (action: "create" | "link") => { const result = await request<{ documentId: string; documentName: string; documentUrl: string; lastSyncedAt: string }>(`/api/projects/${projectId}/google/link`, { action, documentId: action === "link" ? documentId : undefined }); onSyncState({ ...result, status: "synced" }); setView("home"); };
  const syncNow = async () => { onSyncState({ status: "syncing" }); try { const result = await request<{ sync: Partial<GoogleWorkspaceState> }>(`/api/projects/${projectId}/google/sync`); onSyncState(result.sync); } catch { onSyncState({ status: "error" }); } };
  const workbook = async () => { const result = await request<{ workbookId: string; workbookUrl: string }>(`/api/projects/${projectId}/google/workbook`); onSyncState({ workbookId: result.workbookId }); window.open(result.workbookUrl, "_blank", "noopener,noreferrer"); };

  return <div className="canvas-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="sync-dialog" role="dialog" aria-modal="true" aria-label="Workspace Sync">
    <header><div><small>Google Workspace</small><h2>Workspace Sync</h2></div><span className={`sync-badge ${sync.status}`}>{sync.status.replace("-", " ")}</span><button onClick={onClose} aria-label="Close Workspace Sync"><StoryIcon name="close" /></button></header>
    {error && <p className="sync-error" role="alert">{error}</p>}
    {view === "home" && (!connected ? <div className="sync-empty"><StoryIcon name="drive" /><h3>Bring your existing manuscript with you.</h3><p>Import a Google Doc or keep a reading copy synchronized without overwriting either version.</p><a className="primary" href={`/api/integrations/google/connect?service=docs&returnTo=${encodeURIComponent(location.pathname + location.search)}`}>Connect Google</a>{demo && <small>Demo session · connection requires an account</small>}</div> : <>
      <div className="sync-account"><span>{sync.accountEmail?.slice(0, 1).toUpperCase() ?? "G"}</span><div><strong>{sync.accountEmail ?? "Google connected"}</strong><small>{sync.grantedServices.length} granted services</small></div><a href="/studio/settings/integrations/google">Manage permissions</a></div>
      <div className="sync-grid"><article><StoryIcon name="docs" /><small>Linked document</small><strong>{sync.documentName ?? "No document linked"}</strong><span>{sync.lastSyncedAt ? `Last synced ${new Date(sync.lastSyncedAt).toLocaleString()}` : "Choose an existing Doc or create one"}</span>{sync.documentUrl && <a href={sync.documentUrl} target="_blank" rel="noreferrer">Open in Google <StoryIcon name="external" /></a>}</article><article><StoryIcon name="sheets" /><small>Story workbook</small><strong>{sync.workbookId ? "Workbook connected" : "Not created"}</strong><span>Chapters, scenes, entities, questions and continuity</span><button disabled={busy} onClick={() => void workbook()}>Create or refresh workbook</button></article><article><StoryIcon name="calendar" /><small>Writing Calendar</small><strong>Deadlines and sessions</strong><span>Calendar access is managed with your Google permissions.</span><a href="/studio/settings/integrations/google">Manage calendar</a></article></div>
      <footer><button onClick={() => setView("picker")}><StoryIcon name="drive" />Import or link a Doc</button><button disabled={busy} onClick={() => void link("create")}>Create reading copy</button><button className="primary" onClick={() => void syncNow()} disabled={busy || !sync.documentId}><StoryIcon name="sync" />{busy ? "Working…" : "Sync now"}</button></footer>
    </>)}
    {view === "picker" && <div className="picker-view"><button className="back" onClick={() => setView("home")}>Back</button><StoryIcon name="drive" /><h3>Choose a Google Doc</h3><p>Open the secure Google Picker. Morrow requests only the document you choose.</p><button className="google-picker" onClick={() => window.dispatchEvent(new CustomEvent("morrow:google-picker"))}>Open Google Picker</button><label>Selected document<input value={documentId} onChange={(event) => setDocumentId(event.target.value)} placeholder="Choose a Doc or paste its ID" /></label><div className="picker-actions"><button disabled={documentId.length < 10 || busy} onClick={() => void loadPreview()}>{busy ? "Reading…" : "Preview import"}</button><button className="primary" disabled={documentId.length < 10 || busy} onClick={() => void link("link")}>Link as reading copy</button></div></div>}
    {view === "preview" && preview && <div className="import-preview"><button className="back" onClick={() => setView("picker")}>Back</button><h3>{preview.title}</h3><p>{preview.project.chapters.length} chapters · {preview.project.scenes.length} scenes detected</p><ol>{preview.project.chapters.map((chapter) => <li key={chapter.id}><strong>{chapter.title}</strong><span>{preview.project.scenes.filter((scene) => scene.chapterId === chapter.id).length} scenes</span></li>)}</ol><footer><button onClick={() => setView("picker")}>Choose another</button><button className="primary" onClick={() => { onImport(preview); onClose(); }}>Confirm import</button></footer></div>}
    {view === "conflict" && sync.externalChange && <div className="conflict-review"><StoryIcon name="warning" /><h3>Both versions changed</h3><p>Morrow will not overwrite either version. Review each scene before synchronizing.</p>{sync.externalChange.scenes.map((scene) => <article key={scene.sceneId}><h4>{scene.title}</h4><div><section><small>Current Morrow</small><p>{scene.morrow}</p></section><section><small>Google version</small><p>{scene.google}</p></section><section><small>Result</small><textarea defaultValue={scene.morrow} /></section></div></article>)}</div>}
  </section></div>;
}
