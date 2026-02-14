import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EpisodeList } from "@/components/EpisodeList";
import { JsonLd } from "@/components/JsonLd";
import { getSeriesBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return {};
  return {
    title: `${series.title} | EU Webtoon`,
    description: series.description,
    alternates: { canonical: absoluteUrl(`/series/${series.slug}`) },
    openGraph: { title: series.title, description: series.description, images: [absoluteUrl(series.coverUrl)] },
  };
}

export default async function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return notFound();

  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWorkSeries",
          name: series.title,
          description: series.longDescription,
          inLanguage: series.language,
          genre: series.genres,
          url: absoluteUrl(`/series/${series.slug}`),
        }}
      />

      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[300px_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
          <Image src={series.coverUrl} alt={series.coverAlt} fill sizes="300px" className="object-cover" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">{series.language.toUpperCase()} · {series.genres.join(" · ")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{series.title}</h1>
          <p className="mt-2 text-sm text-slate-500">By {series.creatorName}</p>
          <p className="mt-4 text-sm text-slate-700">{series.longDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {series.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">#{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Episodes</h2>
        <p className="mt-1 text-sm text-slate-600">Episode 1 is free on every series. Use Fast Pass credits for early unlocks.</p>
        <div className="mt-4">
          <EpisodeList series={series} />
        </div>
      </section>
    </div>
  );
}
