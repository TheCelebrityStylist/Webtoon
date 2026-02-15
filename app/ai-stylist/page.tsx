import type { Metadata } from "next";
import { AIStudioForm } from "@/components/AIStudioForm";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Studio | EU Webtoon",
  description: "Generate series bibles, outlines, full vertical script beats, and marketing copy with export-ready output.",
  alternates: { canonical: absoluteUrl("/ai-stylist") },
};

export default function AIStudioPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">AI Studio</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">From concept to launch package in one workspace</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-700">Create a complete development stack: logline, themes, character arcs, world rules, 10-episode outline, script beats, and marketing copy.</p>
      </section>
      <AIStudioForm />
    </div>
  );
}
