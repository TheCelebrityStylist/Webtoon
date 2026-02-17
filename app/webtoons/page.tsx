import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SeriesExplorer } from "@/components/SeriesExplorer";
import { getAllSeries, getCollectionSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Webtoons Library | EU Webtoon",
  description: "Start free with European vertical webtoons, then continue with credits or subscription to finish arcs before spoilers.",
  alternates: { canonical: absoluteUrl("/webtoons") },
};

export default async function WebtoonsPage() {
  const [all, trending] = await Promise.all([getAllSeries(), getCollectionSeries("trending", 6)]);

  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Webtoons", item: absoluteUrl("/webtoons") },
          ],
        }}
      />
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Webtoons library built for progression</h1>
        <p className="mt-2 text-sm text-slate-600">Filter by genre, language, mood, and binge readiness. Start free, then continue the same day with credits or monthly subscription perks.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">Binge-ready arcs</div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">New this week</div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">Sponsored placement (labeled)</div>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Trending continuity lanes</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {trending.slice(0, 3).map((s) => (
            <article key={s.slug} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">Start free now. Arc lock in 2 days.</p>
              <div className="mt-3 flex gap-2">
                <Link href={`/series/${s.slug}`} className="cta-secondary px-3 py-2 text-xs">Continue</Link>
                <Link href="/pricing" className="cta-primary px-3 py-2 text-xs">Unlock next</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SeriesExplorer initial={all} />
    </div>
  );
}
