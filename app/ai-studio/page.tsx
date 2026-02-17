import type { Metadata } from "next";
import Link from "next/link";
import { AIStudioForm } from "@/components/AIStudioForm";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Studio Publish Pack | EU Webtoon",
  description: "Turn one idea into a publish-ready series bible, episode blueprints, voice sheets, pacing notes, and marketing kit.",
  alternates: { canonical: absoluteUrl("/ai-studio") },
};

export default function AIStudioPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">AI Studio Pro</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Publish Pack in four guided steps</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-700">Generate a complete production package: Series Bible + Episode blueprints + Character voice sheets + Panel pacing notes + Marketing kit.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Step 1 — Choose goal</p><p className="mt-1 text-sm text-slate-600">Series Bible, Outline, Script, Marketing Kit, Pitch Deck.</p></article>
          <article className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Step 2 — Advanced controls</p><p className="mt-1 text-sm text-slate-600">Audience, comp titles, tone sliders, continuity constraints, content warnings.</p></article>
          <article className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Step 3 — Generate outputs</p><p className="mt-1 text-sm text-slate-600">Narrative structure, voice consistency, scene pacing, localization draft hooks.</p></article>
          <article className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Step 4 — Export</p><p className="mt-1 text-sm text-slate-600">Markdown, print-ready HTML, JSON for production pipelines.</p></article>
        </div>

        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm">
          <p className="font-semibold text-indigo-900">Why pay for AI Studio Pro</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-indigo-900">
            <li>Unlimited projects and premium templates</li>
            <li>Continuity checker across episodes</li>
            <li>Localization draft support for EU audiences</li>
            <li>Panel pacing suggestions tuned for vertical reading</li>
          </ul>
          <Link href="/pricing" className="cta-primary mt-4">Upgrade to AI Studio Pro</Link>
        </div>
      </section>
      <AIStudioForm />
    </div>
  );
}
