"use client";

import { useState } from "react";

export function SeoInsights({ article }: { article: string }) {
  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <section className="section-shell rounded-2xl border border-slate-200 bg-white">
        <h2 className="text-2xl font-semibold tracking-tight">Webtoon insight center</h2>
        <p className="mt-2 text-sm text-slate-600">What is a webtoon, why vertical reading wins retention, and how continuity mechanics help readers finish arcs.</p>
        <button className="cta-secondary mt-4" onClick={() => setExpanded((v) => !v)}>{expanded ? "Hide" : "Learn more"}</button>
        <div className={`mt-4 overflow-hidden transition-all ${expanded ? "max-h-[220rem]" : "max-h-0"}`}>
          <article className="prose prose-slate max-w-none whitespace-pre-line text-sm text-slate-700">{article}</article>
        </div>
      </section>

      <button
        type="button"
        className="fixed bottom-24 right-4 z-30 hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow md:block"
        onClick={() => setDrawerOpen(true)}
      >
        What is a webtoon?
      </button>

      <aside className={`fixed inset-y-0 right-0 z-40 w-full max-w-xl border-l border-slate-200 bg-white p-5 shadow-2xl transition-transform ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Knowledge drawer</h3>
          <button className="cta-secondary px-3 py-1 text-xs" onClick={() => setDrawerOpen(false)}>Close</button>
        </div>
        <article className="prose prose-slate mt-4 max-h-[85vh] overflow-auto whitespace-pre-line pr-2 text-sm text-slate-700">{article}</article>
      </aside>
    </>
  );
}
