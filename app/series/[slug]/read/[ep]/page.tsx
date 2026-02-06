// app/series/[slug]/read/[ep]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import { getEpisode, getSeriesBySlug } from "@/lib/data";

type Props = { params: { slug: string; ep: string } };

export function generateMetadata({ params }: Props): Metadata {
  const series = getSeriesBySlug(params.slug);
  if (!series) return {};

  const episodeNumber = Number(params.ep);
  const episode = getEpisode(series, episodeNumber);
  if (!episode) return {};

  const title = `${series.title} — Episode ${episode.ep}: ${episode.title}`;
  const description = episode.excerpt;
  const canonical = absoluteUrl(`/series/${series.slug}/read/${episode.ep}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: absoluteUrl(series.coverUrl) }],
    },
    twitter: {
      title,
      description,
      images: [absoluteUrl(series.coverUrl)],
    },
    robots: {
      index: episode.isFree,
      follow: true,
      googleBot: {
        index: episode.isFree,
        follow: true,
      },
    },
  };
}

export default function EpisodeReaderPage({ params }: Props) {
  const series = getSeriesBySlug(params.slug);
  if (!series) return notFound();

  const episodeNumber = Number(params.ep);
  const episode = getEpisode(series, episodeNumber);
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
    inLanguage: series.language,
    url: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`),
  };

  return (
    <div className="space-y-6">
      <JsonLd data={jsonLd} />
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          {series.title}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Episode {episode.ep}: {episode.title}
        </h1>
        <p className="text-sm text-neutral-600">
          {new Date(episode.publishedAt).toLocaleDateString("en-GB")} ·{" "}
          {episode.isFree ? "Free to read" : "Fast Pass (paid)"}
        </p>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
        <p className="text-sm leading-6 text-neutral-800">
          {episode.excerpt} This is a sample reader experience in the MVP. Each
          episode will render vertical panels and creator notes here.
        </p>
      </section>

      {!episode.isFree && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-medium">Fast Pass — early access</p>
          <p className="mt-2">
            This episode is paid by default and set to noindex for SEO until
            it’s released for free.
          </p>
        </section>
      )}
    </div>
  );
}
