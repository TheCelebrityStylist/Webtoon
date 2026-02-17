import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ComparisonTable } from "@/components/ComparisonTable";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "For creators | EU Webtoon",
  description: "Foretelling-like creator tooling with monetization, retention analytics, and publishing workflows for vertical webtoons.",
  alternates: { canonical: absoluteUrl("/creators") },
};

export default function CreatorsPage() {
  return (
    <div className="space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "EU Webtoon Creator Program", url: absoluteUrl("/creators") }} />
      <section className="section-shell grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Creator platform: publish, monetize, optimize</h1>
          <p className="mt-3 text-slate-600">EU Webtoon gives creators a Foretelling-style growth stack: arc tools, conversion analytics, payout clarity, AI Studio Pro, and community amplification.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/creator-portal" className="cta-primary">Open creator portal</Link>
            <Link href="/pricing" className="cta-secondary">See creator plans</Link>
          </div>
        </div>
        <Image src="/illustrations/creator-earnings.svg" alt="Creator earnings illustration" width={1200} height={800} className="rounded-2xl border border-slate-200 bg-white" />
      </section>

      <section id="creator-flow">
        <HowItWorksSection defaultTrack="creator" large />
      </section>

      <section className="section-shell rounded-2xl border border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-semibold tracking-tight">Creator monetization stack</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Early unlock revenue share with transparent reporting.</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Tips, bundles, and premium POV add-ons.</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Creator Pro and Studio+ plans with AI Studio Pro.</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Launch optimization via retention and cliffhanger scoring.</div>
        </div>
      </section>

      <ComparisonTable />
    </div>
  );
}
