import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SeriesExplorer } from "@/components/SeriesExplorer";
import { getAllSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Browse Series | EU Webtoon",
  description: "Filter by genre, language, and tags. Discover free-first series and unlock premium episodes when you choose.",
  alternates: { canonical: absoluteUrl("/series") },
};

export default async function SeriesPage() {
  const all = await getAllSeries();

  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "EU Webtoon library",
          itemListElement: all.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/series/${item.slug}`),
            name: item.title,
          })),
        }}
      />
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Browse the library</h1>
        <p className="mt-2 text-sm text-slate-600">Use filters and sorting to find your next read quickly. Episode one is free on all launch titles.</p>
      </section>
      <SeriesExplorer initial={all} />
    </div>
  );
}
