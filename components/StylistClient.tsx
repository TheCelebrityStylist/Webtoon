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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-200 p-5">
        <div>
          <label className="text-sm font-medium text-neutral-800">Your style prompt</label>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-800">Budget (€)</label>
          <input
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            type="number"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Style my look
        </button>
      </form>

      {jobId && (
        <section className="space-y-3">
          <p className="text-sm text-neutral-700">{opening}</p>
          {!hasResults && !timedOut && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              <p>{loadingLine(loadingStep)}</p>
              <p className="mt-2 text-xs text-neutral-500">
                {elapsed.toFixed(1)}s
              </p>
            </div>
          )}
          {timedOut && !hasResults && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              <p>Here’s the edit as it stands right now—fresh picks coming in fast.</p>
            </div>
          )}
        </section>
      )}

      {hasResults && job && (
        <section className="space-y-6">
          {Object.entries(job.productsBySlot).map(([slot, items]) => (
            <div key={slot} className="space-y-3">
              <h3 className="text-lg font-semibold tracking-tight">{slot}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <article key={item.url} className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium hover:underline"
                        >
                          {item.title}
                        </a>
                        <p className="text-xs text-neutral-600">
                          {item.retailer} · €{item.price.toFixed(0)}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {itemCommentary(item.title)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800">
            {summaryLine(job.result?.total ?? 0, "EUR")}
          </div>
        </section>
      )}
    </div>
  );
}
