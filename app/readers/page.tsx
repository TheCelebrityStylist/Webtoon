import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ComparisonTable } from "@/components/ComparisonTable";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { JsonLd } from "@/components/JsonLd";
import { SeriesCard } from "@/components/SeriesCard";
import { getCollectionSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "For readers | EU Webtoon",
  description: "Finish arcs without losing momentum: free starts, continuity lane, spoiler shielding, and early unlock rewards.",
  alternates: { canonical: absoluteUrl("/readers") },
};

export default async function ReadersPage() {
  const featured = await getCollectionSeries("trending", 6);
  return (
    <div className="space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "EU Webtoon Readers", url: absoluteUrl("/readers") }} />
      <section className="section-shell premium-hero grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Reader platform: finish arcs before spoilers do</h1>
          <p className="mt-3 text-slate-600">EU Webtoon keeps you in continuity: arc lane progress, streak protection, bonus POV scenes, and unlock options when cliffhangers hit.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/webtoons" className="cta-primary">Start reading free</Link>
            <Link href="/pricing" className="cta-secondary">Unlock your first Arc Pass</Link>
          </div>
        </div>
        <Image src="/illustrations/reading-momentum.svg" alt="Reading momentum illustration" width={1200} height={800} className="rounded-2xl border border-slate-200 bg-white" />
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Trending now</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((series) => <SeriesCard key={series.slug} s={series} />)}
        </div>
      </section>

      <section id="reader-flow"><HowItWorksSection defaultTrack="reader" large /></section>

      <section className="section-shell rounded-2xl border border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-semibold tracking-tight">Pricing preview</h2>
        <p className="mt-2 text-sm text-slate-700">Start free, then choose credits, Continuity+, or Superfan depending on how fast you want arc completion and bonus unlocks.</p>
        <Link href="/pricing" className="cta-primary mt-4">Open reader pricing</Link>
      </section>

      <section><ComparisonTable /></section>
    </div>
  );
}
