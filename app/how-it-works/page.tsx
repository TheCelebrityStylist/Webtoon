import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How it works | EU Webtoon",
  description: "Understand free episodes, credits, subscriptions, creator support, and how to keep your reading streak active.",
  alternates: { canonical: absoluteUrl("/how-it-works") },
};

export default function HowItWorksPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">How EU Webtoon works</h1>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Start with free episodes and pick your continuity lane.</li>
          <li>Unlock cliffhanger arcs with credits or monthly subscription perks.</li>
          <li>Maintain streak, avoid spoilers, and unlock creator bonus scenes.</li>
        </ol>
        <div className="mt-4 flex gap-3">
          <Link href="/webtoons" className="cta-secondary">Start free</Link>
          <Link href="/pricing" className="cta-primary">See plans</Link>
        </div>
      </section>
    </div>
  );
}
