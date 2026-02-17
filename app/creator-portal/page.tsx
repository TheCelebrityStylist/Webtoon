import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Creator portal | EU Webtoon",
  description: "Foretelling-like creator dashboard: monetization, retention analytics, promotions, and launch workflow.",
  alternates: { canonical: absoluteUrl("/creator-portal") },
};

const tabs = ["Overview", "Series", "Monetization", "Analytics", "Promotions", "Studio"];

export default function CreatorPortalPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell premium-hero">
        <h1 className="text-3xl font-semibold tracking-tight">Creator portal</h1>
        <p className="mt-2 text-sm text-slate-600">Your command center for shipping arcs, converting fans, and forecasting earnings.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {tabs.map((tab) => <span key={tab} className="pill">{tab}</span>)}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">30-day earnings</p><p className="mt-1 text-2xl font-bold">€6,420</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Unlock conversion</p><p className="mt-1 text-2xl font-bold">19.1%</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Completion rate</p><p className="mt-1 text-2xl font-bold">63%</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Promo CTR</p><p className="mt-1 text-2xl font-bold">7.8%</p></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Retention + cliffhanger graph (demo)</h2>
          <div className="mt-3 h-56 rounded-xl bg-[linear-gradient(180deg,#e0e7ff,#fff)] p-3 text-xs text-slate-600">Week-by-week retention with cliffhanger score overlays and actionable rewrite cues.</div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Launch a new series</h2>
          <form className="mt-3 space-y-2 text-sm">
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Title" />
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Genre + tags" />
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Languages" />
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Publish cadence (e.g., weekly)" />
            <label className="block rounded-lg border border-dashed border-slate-300 px-3 py-3 text-slate-500">Upload cover (UI demo)</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="rounded-lg border border-slate-300 px-2 py-1">Early unlock <input type="checkbox" className="ml-2" defaultChecked /></label>
              <label className="rounded-lg border border-slate-300 px-2 py-1">Tips <input type="checkbox" className="ml-2" defaultChecked /></label>
            </div>
            <button type="submit" className="cta-primary w-full justify-center">Create series draft</button>
          </form>
        </article>
      </section>
    </div>
  );
}
