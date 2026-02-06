// app/series/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getSeriesBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { EpisodeList } from "@/components/EpisodeList";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const series = getSeriesBySlug(params.slug);
  if (!series) return {};

  const title = series.title;
  const description = `${series.logline} Read free episodes or unlock early access.`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/series/${series.slug}`) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/series/${series.slug}`),
      images: [{ url: absoluteUrl(series.coverUrl) }],
    },
    twitter: {
      title,
      description,
      images: [absoluteUrl(series.coverUrl)],
    },
  };
}

export default function SeriesPage({ params }: Props) {
  const series = getSeriesBySlug(params.slug);
  if (!series) return notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    name: series.title,
    description: series.description,
    inLanguage: series.language,
    genre: series.genres,
    dateModified: series.updatedAt,
    url: absoluteUrl(`/series/${series.slug}`),
    author: { "@type": "Person", name: series.creatorName },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <h1 className="text-3xl font-semibold tracking-tight">{series.title}</h1>
      <p className="mt-2 text-neutral-700">{series.logline}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {series.genres.map((g) => (
          <span
            key={g}
            className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700"
          >
            {g}
          </span>
        ))}
      </div>

      <p className="mt-6 text-sm text-neutral-700">{series.description}</p>

      <EpisodeList series={series} />
    </>
  );
}
