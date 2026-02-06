// app/series/[slug]/read/[ep]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import { getEpisode, getSeriesBySlug } from "@/lib/data";
import { StoryRender } from "@/components/StoryRender";

type Props = { params: { slug: string; ep: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
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

export default async function EpisodeReaderPage({ params }: Props) {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return notFound();

  const episodeNumber = Number(params.ep);
  const episode = getEpisode(series, episodeNumber);
  if (!episode) return notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
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
    <div className="stack" style={{ gap: "24px" }}>
      <JsonLd data={jsonLd} />
      <div
        style={{
          position: "sticky",
          top: 72,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          padding: "12px 0",
          zIndex: 2,
        }}
      >
        <Link href={`/series/${series.slug}`} className="btn btnGhost">
          Back to series
        </Link>
      </div>

      <section className="stack">
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {series.title}
        </p>
        <h1 className="heroTitle" style={{ fontSize: "2rem" }}>
          Episode {episode.ep}: {episode.title}
        </h1>
        <div className="chipRow">
          <span className="chip">
            {new Date(episode.publishedAt).toLocaleDateString("en-GB")}
          </span>
          <span className="chip">{episode.isFree ? "Free" : "Fast Pass"}</span>
        </div>
      </section>

      <section className="card" style={{ padding: "24px", maxWidth: "60rem" }}>
        <StoryRender content={episode.content} />
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
        <span className="btn btnGhost" aria-disabled="true" style={{ opacity: 0.6 }}>
          Next episode
        </span>
        <Link href={`/series/${series.slug}`} className="btn btnPrimary">
          Back to series
        </Link>
      </div>
    </div>
  );
}
