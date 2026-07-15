"use client";

import { useState } from "react";

type FileKind = "docs" | "sheets";
type GoogleFile = { id: string; name: string; mimeType: string; modifiedTime?: string };

export function GoogleFileBrowser() {
  const [kind, setKind] = useState<FileKind>("docs");
  const [files, setFiles] = useState<GoogleFile[]>([]);
  const [message, setMessage] = useState("Choose what you want to preview. Nothing is imported until you confirm it.");
  const [busy, setBusy] = useState(false);

  async function load(nextKind: FileKind) {
    setKind(nextKind);
    setBusy(true);
    setMessage("Looking in the files you granted Morrow permission to use…");
    try {
      const response = await fetch(`/api/integrations/google/files?type=${nextKind}`);
      const data = (await response.json()) as { files?: GoogleFile[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Google files could not be loaded");
      setFiles(data.files ?? []);
      setMessage(data.files?.length ? "Select a file to inspect it in Google. Morrow will ask again before importing." : "No matching files are available with this permission yet.");
    } catch (error) {
      setFiles([]);
      setMessage(error instanceof Error ? error.message : "Google files could not be loaded");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="google-browser" aria-labelledby="google-browser-title">
      <p className="eyebrow">YOUR FILES</p>
      <h2 id="google-browser-title">Preview before you bring anything in</h2>
      <p>{message}</p>
      <div className="button-row" aria-label="Google file type">
        <button className={kind === "docs" ? "button" : "button secondary"} onClick={() => load("docs")} disabled={busy}>Browse Docs</button>
        <button className={kind === "sheets" ? "button" : "button secondary"} onClick={() => load("sheets")} disabled={busy}>Browse Sheets</button>
      </div>
      {files.length > 0 && (
        <ul className="google-file-list">
          {files.map(file => (
            <li key={file.id}>
              <span><strong>{file.name}</strong>{file.modifiedTime && <small>Updated {new Date(file.modifiedTime).toLocaleDateString()}</small>}</span>
              <a className="text-link" href={`https://${kind === "docs" ? "docs" : "sheets"}.google.com/${kind === "docs" ? "document" : "spreadsheets"}/d/${file.id}`} target="_blank" rel="noreferrer">Open in Google ↗</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
