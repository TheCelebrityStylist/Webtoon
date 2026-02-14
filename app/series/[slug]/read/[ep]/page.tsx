import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEpisode, getSeriesBySlug } from "@/lib/data";

type RouteParams = { slug: string; ep: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, ep } = await params;
  const epNum = Number(ep);

  const series = getSeriesBySlug(slug);
  const episode = Number.isFinite(epNum) ? getEpisode(slug, epNum) : null;

  if (!series || !episode) return { title: "Episode not found" };

  const title = `${series.title} — Episode ${episode.ep}: ${episode.title}`;

  return {
    title: `${title} — EU Webtoon`,
    description: series.tagline ?? series.synopsis,
    openGraph: {
      title: `${title} — EU Webtoon`,
      description: series.tagline ?? series.synopsis,
      type: "article",
    },
  };
}

export default async function ReadEpisodePage({ params }: Props) {
  const { slug, ep } = await params;
  const epNum = Number(ep);

  if (!Number.isFinite(epNum)) notFound();

  const series = getSeriesBySlug(slug);
  if (!series) notFound();

  const episode = getEpisode(slug, epNum);
  if (!episode) notFound();

  const isFree = episode.kind === "free";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href={`/series/${series.slug}`}
          className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          ← Back to {series.title}
        </Link>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isFree ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {isFree ? "Free" : "Fast Pass"}
        </span>

        <span className="text-sm text-slate-500">
          Episode {episode.ep} • {episode.date}
        </span>
      </div>

      <header className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {episode.title}
        </h1>
        <p className="mt-2 text-slate-600">{series.tagline}</p>
      </header>

      <article className="prose prose-slate mt-8 max-w-none rounded-3xl border bg-white p-6 shadow-sm">
        <div dangerouslySetInnerHTML={{ __html: episode.contentHtml }} />
      </article>

      <nav className="mt-8 flex items-center justify-between">
        <Link
          href={epNum > 1 ? `/series/${series.slug}/read/${epNum - 1}` : `/series/${series.slug}`}
          className="rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          {epNum > 1 ? "← Previous" : "Back to series"}
        </Link>

        <Link
          href={`/series/${series.slug}/read/${epNum + 1}`}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Next →
        </Link>
      </nav>
    </main>
  );
}
