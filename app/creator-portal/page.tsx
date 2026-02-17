import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Creator portal | EU Webtoon",
  description: "Demo dashboard for creator earnings, retention signals, conversion funnels, and episode performance recommendations.",
  alternates: { canonical: absoluteUrl("/creator-portal") },
};

export default function CreatorPortalPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Creator portal (demo)</h1>
        <p className="mt-2 text-sm text-slate-600">Foretelling-like analytics and action cues for better completion and unlock conversion.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Earnings forecast</p><p className="mt-1 text-2xl font-bold">€4,820</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Active arcs</p><p className="mt-1 text-2xl font-bold">12</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Unlock conversion</p><p className="mt-1 text-2xl font-bold">18.4%</p></div>
      </section>
      <section className="section-shell rounded-2xl border border-slate-200 bg-white">
        <h2 className="text-xl font-semibold">Retention graph (mock)</h2>
        <div className="mt-4 h-48 rounded-xl bg-[linear-gradient(180deg,#e2e8f0,#fff)] p-3">
          <div className="h-full w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">Week 1 → Week 6 retention trend with cliffhanger score overlays.</div>
        </div>
      </section>
      <section className="section-shell grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="font-semibold">Drop-off heatmap (mock)</h3><p className="mt-2 text-sm text-slate-600">Highest drop at panel transitions in Ep 4 midpoint. Suggested: shorten exposition block by 18%.</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="font-semibold">Cliffhanger score (mock)</h3><p className="mt-2 text-sm text-slate-600">Ep 3 score: 8.6/10. Suggestion: reinforce emotional consequence in first 120 words of Ep 4.</p></div>
      </section>
    </div>
  );
}
