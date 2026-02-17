import type { Metadata } from "next";
import Link from "next/link";
import { AIStudioForm } from "@/components/AIStudioForm";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Studio | EU Webtoon",
  description: "Turn one idea into a publish-ready episode pack, series assets, and marketing kit with AI Studio Pro controls.",
  alternates: { canonical: absoluteUrl("/ai-studio") },
};

export default function AIStudioPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">AI Studio Pro</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Turn an idea into a publish-ready episode pack</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-700">Guided flow: choose goal, set advanced controls, generate episode pack + series assets + marketing kit, then export markdown/JSON/PDF-ready HTML.</p>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <p>• Templates for romance, mystery, fantasy, thriller</p>
          <p>• Continuity checker and panel pacing suggestions</p>
          <p>• Multi-language localization drafts</p>
          <p>• AI Studio Pro plan for unlimited projects</p>
        </div>
        <Link href="/pricing" className="cta-primary mt-4">Upgrade to AI Studio Pro</Link>
      </section>
      <AIStudioForm />
    </div>
  );
}
