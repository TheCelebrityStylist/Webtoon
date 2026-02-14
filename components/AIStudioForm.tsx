"use client";

import { useMemo, useState } from "react";
import type { GeneratedSeriesPayload } from "@/lib/types";

const genres = ["Romance", "Fantasy", "Mystery", "Comedy", "Slice of Life", "Sci-Fi", "Horror"];
const tones = ["Cozy", "Dark", "Funny", "Dramatic", "Wholesome", "Gritty"];
const lengths = ["Short story 1,500–2,500 words", "Episode 1: 1,200–1,800 words"];
const languages = ["EN", "NL", "FR", "DE", "ES", "IT"];

const emptyPayload: GeneratedSeriesPayload | null = null;

export function AIStudioForm() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Romance");
  const [tone, setTone] = useState("Cozy");
  const [setting, setSetting] = useState("");
  const [mainCharacter, setMainCharacter] = useState("");
  const [coreConflict, setCoreConflict] = useState("");
  const [targetLength, setTargetLength] = useState(lengths[1]);
  const [language, setLanguage] = useState("EN");
  const [verticalPacing, setVerticalPacing] = useState(true);
  const [mode, setMode] = useState<"series+episode" | "outline">("series+episode");
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<GeneratedSeriesPayload | null>(emptyPayload);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  const payloadJson = useMemo(() => (payload ? JSON.stringify(payload.series, null, 2) : ""), [payload]);

  async function handleGenerate(requestMode: "series+episode" | "outline") {
    setMode(requestMode);
    setLoading(true);
    setPublishStatus(null);

    const response = await fetch("/api/ai/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: requestMode,
        inputs: {
          title,
          genre,
          tone,
          setting,
          mainCharacter,
          coreConflict,
          targetLength,
          language,
          verticalPacing,
        },
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as GeneratedSeriesPayload;
      setPayload(data);
    }

    setLoading(false);
  }

  async function handlePublish() {
    if (!payload) return;
    setPublishStatus("Publishing...");
    const response = await fetch("/api/ai/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ series: payload.series }),
    });
    if (response.ok) {
      const data = await response.json();
      setPublishStatus(data.stored ? "Published to data/generated.json" : "Stored in memory. Download JSON below.");
    } else {
      setPublishStatus("Publish failed. Download JSON and add to seed file.");
    }
  }

  function handleExport() {
    if (!payload) return;
    const blob = new Blob([payloadJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${payload.series.slug}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="twoColumn">
      <form className="card form">
        <div className="stack">
          <p className="tagline" style={{ margin: 0 }}>
            Generator
          </p>
          <h2 style={{ margin: 0 }}>Series generator</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Provide a few inputs to generate a ready-to-publish pilot episode.
          </p>
        </div>
        <label className="formField">
          Title (optional)
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Let the AI propose a title"
            className="input"
          />
        </label>
        <div className="formGrid">
          <label className="formField">
            Genre
            <select value={genre} onChange={(event) => setGenre(event.target.value)} className="select">
              {genres.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className="formField">
            Tone
            <select value={tone} onChange={(event) => setTone(event.target.value)} className="select">
              {tones.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="formField">
            Language
            <select value={language} onChange={(event) => setLanguage(event.target.value)} className="select">
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="formField">
          Setting
          <input
            value={setting}
            onChange={(event) => setSetting(event.target.value)}
            placeholder="City, era, mood"
            className="input"
          />
        </label>
        <label className="formField">
          Main character
          <input
            value={mainCharacter}
            onChange={(event) => setMainCharacter(event.target.value)}
            placeholder="Who leads the story?"
            className="input"
          />
        </label>
        <label className="formField">
          Core conflict
          <input
            value={coreConflict}
            onChange={(event) => setCoreConflict(event.target.value)}
            placeholder="What threatens everything?"
            className="input"
          />
        </label>
        <label className="formField">
          Target length
          <select value={targetLength} onChange={(event) => setTargetLength(event.target.value)} className="select">
            {lengths.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="formField" style={{ flexDirection: "row", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={verticalPacing}
            onChange={(event) => setVerticalPacing(event.target.checked)}
          />
          Make it Webtoon-style vertical pacing
        </label>
        <div className="formActions">
          <button
            type="button"
            className="btn btnPrimary"
            onClick={() => handleGenerate("series+episode")}
            disabled={loading}
          >
            {loading && mode === "series+episode" ? "Generating..." : "Generate Series + Episode 1"}
          </button>
          <button
            type="button"
            className="btn btnGhost"
            onClick={() => handleGenerate("outline")}
            disabled={loading}
          >
            {loading && mode === "outline" ? "Generating..." : "Generate 10-episode outline"}
          </button>
          <button type="button" className="btn btnGhost" onClick={handleExport} disabled={!payload}>
            Export generated JSON
          </button>
        </div>
      </form>

      <aside className="stack">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Series preview</h3>
          {payload ? (
            <div className="stack">
              <div className="cardCover" />
              <strong>{payload.series.title}</strong>
              <p style={{ margin: 0, color: "var(--muted)" }}>{payload.series.logline}</p>
              <div className="chipRow">
                {payload.series.genres.map((g) => (
                  <span key={g} className="chip">
                    {g}
                  </span>
                ))}
                <span className="chip">{payload.series.language.toUpperCase()}</span>
              </div>
              <button type="button" className="btn btnPrimary" onClick={handlePublish}>
                Publish to MVP Library
              </button>
              {publishStatus && <p style={{ margin: 0, color: "var(--muted)" }}>{publishStatus}</p>}
              {!publishStatus && (
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  On Vercel, file writes may be blocked. Download JSON if needed.
                </p>
              )}
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--muted)" }}>Generate a series to preview here.</p>
          )}
        </div>
      </aside>

      {payload && (
        <section className="surface" style={{ gridColumn: "1 / -1" }}>
          <div className="twoColumn">
            <div className="stack">
              <h2 style={{ marginTop: 0 }}>Episode 1</h2>
              <p style={{ color: "var(--muted)" }}>{payload.series.episodes[0]?.excerpt}</p>
              <div className="stack" style={{ gap: "12px" }}>
                {payload.series.episodes[0]?.content?.split(/\n\n+/).map((block, idx) => (
                  <p key={idx} style={{ margin: 0, lineHeight: 1.7 }}>
                    {block}
                  </p>
                ))}
              </div>
            </div>
            <div className="stack">
              <h3 style={{ marginTop: 0 }}>Outline</h3>
              {payload.outline ? (
                <ul className="list">
                  {payload.outline.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}:</strong> {item.summary}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, color: "var(--muted)" }}>Generate an outline to view here.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {payloadJson && (
        <section className="card" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ marginTop: 0 }}>Generated JSON</h3>
          <p style={{ color: "var(--muted)" }}>
            If file storage is unavailable, copy/paste this into <code>data/generated.json</code>.
          </p>
          <pre className="codeBlock">{payloadJson}</pre>
        </section>
      )}
    </div>
  );
}
