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
  description: "Wattpad-style discovery meets arc completion mechanics. Read free, keep continuity, and finish stories without waiting.",
  alternates: { canonical: absoluteUrl("/readers") },
};

export default async function ReadersPage() {
  const featured = await getCollectionSeries("trending", 6);
  return (
    <div className="space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "EU Webtoon Readers", url: absoluteUrl("/readers") }} />
      <section className="section-shell grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Reader platform: discovery + completion</h1>
          <p className="mt-3 text-slate-600">Think Wattpad community energy, but with a Foretelling-style progression layer: Arc Lane, streak continuity, spoiler protection, and rewards for finishing what you start.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/webtoons" className="cta-primary">Start reading free</Link>
            <Link href="/pricing" className="cta-secondary">See reader pricing</Link>
          </div>
        </div>
        <Image src="/illustrations/reading-momentum.svg" alt="Reading momentum illustration" width={1200} height={800} className="rounded-2xl border border-slate-200 bg-white" />
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Featured series</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((series) => <SeriesCard key={series.slug} s={series} />)}
        </div>
      </section>

      <section id="reader-flow">
        <HowItWorksSection defaultTrack="reader" large />
      </section>

      <section className="section-shell rounded-2xl border border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-semibold tracking-tight">Arc Lane in plain language</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
          <Image src="/illustrations/arc-lane.svg" alt="Arc lane illustration" width={1200} height={800} className="rounded-xl border border-slate-200 bg-white" />
          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>Arc Progress:</strong> see exactly how close you are to the next payoff.</p>
            <p><strong>Spoiler Risk:</strong> know when waiting increases reveal exposure.</p>
            <p><strong>Bonus Unlock Tier:</strong> unlock POV scenes, creator notes, and extras when you complete arcs.</p>
            <p><strong>Continuity Lane:</strong> keep momentum across multiple active series instead of restarting context every week.</p>
          </div>
        </div>
      </section>

      <section>
        <ComparisonTable />
      </section>
    </div>
  );
}
