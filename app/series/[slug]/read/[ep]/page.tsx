// app/series/[slug]/read/[ep]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getEpisode, getSeriesBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

type Props = { params: { slug: string; ep: string } };

export function generateMetadata({ params }: Props): Metadata {
  const series = getSeriesBySlug(params.slug);
  if (!series) return {};
  const epNum = Number(params.ep);
  const episode = getEpisode(series, epNum);
  if (!episode) return {};

  const title = `${series.title} — Episode ${episode.ep}: ${episode.title}`;
  const description = episode.excerpt;

  // SEO choice:
  // - Free episodes: indexable
  // - Paid/fast-pass episodes: typically NOINDEX until they become free (you can flip later)
  const indexable = episode.isFree;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`),
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`),
      images: [{ url: absoluteUrl(series.coverUrl) }],
    },
  };
}

export default function EpisodePage({ params }: Props) {
  const series = getSeriesBySlug(params.slug);
  if (!series) return notFound();
  const epNum = Number(params.ep);
  const episode = getEpisode(series, epNum);
  if (!episode) return notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: `Episode ${episode.ep}: ${episode.title}`,
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: series.title,
      url: absoluteUrl(`/series/${series.slug}`),
    },
    datePublished: episode.publishedAt,
    url: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <header className="space-y-2">
        <p className="text-sm text-neutral-600">
          {series.title} · Episode {episode.ep}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{episode.title}</h1>
        <p className="text-sm text-neutral-700">{episode.excerpt}</p>
        <p className="text-xs text-neutral-600">
          {episode.isFree ? "Free episode" : "Fast Pass (paid) — demo content"}
        </p>
      </header>

      {/* MVP reader: placeholder. Replace with image panels from storage later. */}
      <article className="prose mt-8 max-w-none">
        <p>
          This is the reader page. For SEO, free episodes can be fully indexable.
          For paid episodes, keep <code>noindex</code> until they rotate to free.
        </p>
        <p>
          Next step: store episode panels in Supabase Storage and render them
          as vertically stacked images with width/height attributes for Core Web Vitals.
        </p>
      </article>
    </>
  );
}
