"use client";

import { useEffect, useMemo, useState } from "react";
import { openingLine, loadingLine, itemCommentary, summaryLine } from "@/lib/stylistCopy";
import type { LookProduct } from "@/lib/lookJob";

type JobResponse = {
  status: "queued" | "running" | "completed" | "failed";
  jobId: string;
  progress: number;
  productsBySlot: Record<string, LookProduct[]>;
  result: { summary: string; total: number; items: LookProduct[] } | null;
};

const maxWaitMs = 8000;

export function StylistClient() {
  const [prompt, setPrompt] = useState("Zendaya red carpet in sleek black under €800");
  const [budget, setBudget] = useState("800");
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const hasResults = Boolean(job?.result?.items?.length);
  const opening = useMemo(() => openingLine(prompt), [prompt]);

  useEffect(() => {
    if (!jobId) return;

    const start = Date.now();
    setStartedAt(start);
    setTimedOut(false);

    const interval = setInterval(async () => {
      const response = await fetch(`/api/look/${jobId}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as JobResponse;
      setJob(data);
      if (data.status === "completed" || data.status === "failed") {
        clearInterval(interval);
      }
      if (Date.now() - start >= maxWaitMs) {
        setTimedOut(true);
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    if (!jobId || timedOut) return;
    const interval = setInterval(() => {
      setLoadingStep((step) => step + 1);
    }, 900);
    return () => clearInterval(interval);
  }, [jobId, timedOut]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setJob(null);
    setJobId(null);
    setTimedOut(false);

    const response = await fetch("/api/look", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, budget: Number(budget), currency: "EUR" }),
    });

    if (!response.ok) return;
    const data = (await response.json()) as { jobId: string };
    setJobId(data.jobId);

    fetch(`/api/look/${data.jobId}/run`, { method: "POST" });
  };

  const elapsed = startedAt ? Math.min((Date.now() - startedAt) / 1000, 8) : 0;

  return (
    <div className="stack">
      <form onSubmit={handleSubmit} className="card form">
        <div className="stack">
          <h2 style={{ margin: 0 }}>Describe your look</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Share the occasion, vibe, and budget. We’ll curate a complete outfit.
          </p>
        </div>
        <label className="formField">
          Your style prompt
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            className="textarea"
          />
        </label>
        <label className="formField">
          Budget (€)
          <input
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className="input"
            type="number"
          />
        </label>
        <button type="submit" className="btn btnPrimary">
          Style my look
        </button>
      </form>

      {jobId && (
        <section className="stack">
          <p style={{ margin: 0, color: "var(--muted)" }}>{opening}</p>
          {!hasResults && !timedOut && (
            <div className="card" style={{ background: "var(--surface-alt)" }}>
              <p style={{ margin: 0 }}>{loadingLine(loadingStep)}</p>
              <p style={{ margin: "8px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                {elapsed.toFixed(1)}s
              </p>
            </div>
          )}
          {timedOut && !hasResults && (
            <div className="card" style={{ background: "var(--surface-alt)" }}>
              <p style={{ margin: 0 }}>Here’s the edit as it stands right now—fresh picks coming in fast.</p>
            </div>
          )}
        </section>
      )}

      {hasResults && job && (
        <section className="stack">
          {Object.entries(job.productsBySlot).map(([slot, items]) => (
            <div key={slot} className="stack">
              <h3 style={{ marginBottom: 0 }}>{slot}</h3>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                {items.map((item) => (
                  <article key={item.url} className="card">
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div
                        style={{
                          height: "80px",
                          width: "80px",
                          flexShrink: 0,
                          overflow: "hidden",
                          borderRadius: "12px",
                          background: "#e2e8f0",
                        }}
                      >
                        {item.image && (
                          <img src={item.image} alt={item.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                      <div className="stack" style={{ gap: "6px" }}>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
                          {item.title}
                        </a>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                          {item.retailer} · €{item.price.toFixed(0)}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                          {itemCommentary(item.title)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}

          <div className="card" style={{ background: "var(--surface-alt)" }}>
            {summaryLine(job.result?.total ?? 0, "EUR")}
          </div>
        </section>
      )}
    </div>
  );
}
