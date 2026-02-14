import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisode, getSeriesBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

// Next.js 15.5+ App Router typechecks `params` as a Promise in `PageProps`.
type Props = { params: Promise<{ slug: string; ep: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, ep } = await params;

  const series = getSeriesBySlug(slug);
  if (!series) return {};

  const epNum = Number(ep);
  const episode = getEpisode(series, epNum);
  if (!episode) return {};

  const title = `${series.title} — Episode ${episode.ep}: ${episode.title}`;
  const description = episode.summary;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`),
      images: [{ url: absoluteUrl(series.coverUrl) }],
    },
  };
}

export default async function EpisodePage({ params }: Props) {
  const { slug, ep } = await params;

  const series = getSeriesBySlug(slug);
  if (!series) return notFound();

  const epNum = Number(ep);
  const episode = getEpisode(series, epNum);
  if (!episode) return notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/series/${series.slug}`}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Back to series
        </Link>
        <div className="text-sm text-neutral-500">
          Episode {episode.ep} / {series.episodes.length}
        </div>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">{episode.title}</h1>
      <p className="mt-2 text-neutral-600">{episode.summary}</p>

      <article className="prose prose-neutral mt-8 max-w-none">
        {episode.panels.map((p, idx) => (
          <section key={idx} className="mb-10">
            <p className="whitespace-pre-wrap leading-relaxed">{p}</p>
          </section>
        ))}
      </article>

      <div className="mt-10 flex items-center justify-between">
        {epNum > 1 ? (
          <Link
            className="rounded-full border px-4 py-2 text-sm hover:bg-neutral-50"
            href={`/series/${series.slug}/read/${epNum - 1}`}
          >
            ← Prev
          </Link>
        ) : (
          <span />
        )}

        {epNum < series.episodes.length ? (
          <Link
            className="rounded-full border px-4 py-2 text-sm hover:bg-neutral-50"
            href={`/series/${series.slug}/read/${epNum + 1}`}
          >
            Next →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
