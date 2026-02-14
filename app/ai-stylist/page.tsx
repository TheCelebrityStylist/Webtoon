import type { Metadata } from "next";
import { AIStudioForm } from "@/components/AIStudioForm";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Studio for Webtoon Creators",
  description: "Generate series bibles, episode outlines, long-form scripts, and launch copy in one workflow.",
  alternates: { canonical: absoluteUrl("/ai-stylist") },
};

export default function AIStudioPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">AI Studio</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Plan, write, and launch faster</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-700">Use deterministic generation to prototype a complete series package: story bible, 10-episode structure, panel-by-panel beats, and marketing copy designed for discovery and conversion.</p>
      </section>
      <AIStudioForm />
    </div>
  );
}
