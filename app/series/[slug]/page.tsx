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
    <div className="stack" style={{ gap: "24px" }}>
      <JsonLd data={jsonLd} />
      <section className="hero" style={{ padding: "32px" }}>
        <h1 className="hero-title" style={{ fontSize: "2.25rem" }}>
          {series.title}
        </h1>
        <p className="hero-subtitle">{series.logline}</p>
        <div className="chip-row">
          {series.genres.map((g) => (
            <span key={g} className="chip">
              {g}
            </span>
          ))}
          <span className="chip">{series.language.toUpperCase()}</span>
        </div>
        <p style={{ marginTop: "16px", color: "#4b5563" }}>{series.description}</p>
      </section>

      <section>
        <h2 className="section-title">Episodes</h2>
        <EpisodeList series={series} />
      </section>
    </div>
  );
}
