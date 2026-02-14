import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { StoryRender } from "@/components/StoryRender";
import { getEpisode, getSeriesBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string; ep: string } }): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return {};
  const epNum = Number(params.ep);
  const episode = getEpisode(series, epNum);
  if (!episode) return {};
  return {
    title: `${series.title} — Episode ${episode.ep}: ${episode.title}`,
    description: episode.excerpt,
    alternates: { canonical: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`) },
    robots: { index: episode.isFree, follow: true },
  };
}

export default async function EpisodeReaderPage({ params }: { params: { slug: string; ep: string } }) {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return notFound();

  const epNum = Number(params.ep);
  const episode = getEpisode(series, epNum);
  if (!episode) return notFound();

  const all = series.episodes.slice().sort((a, b) => a.ep - b.ep);
  const currentIndex = all.findIndex((item) => item.ep === episode.ep);
  const prev = currentIndex > 0 ? all[currentIndex - 1] : null;
  const next = currentIndex < all.length - 1 ? all[currentIndex + 1] : null;
  const progress = Math.round(((currentIndex + 1) / all.length) * 100);

  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: `${series.title} Episode ${episode.ep}`,
          isPartOf: absoluteUrl(`/series/${series.slug}`),
          datePublished: episode.publishedAt,
          inLanguage: series.language,
        }}
      />
      <div className="sticky top-16 z-20 rounded-xl border border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/series/${series.slug}`} className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">← Back to series</Link>
          <span className="text-xs text-slate-500">Progress {progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${progress}%` }} /></div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">{series.title}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Episode {episode.ep}: {episode.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{new Date(episode.publishedAt).toLocaleDateString("en-GB")} · {episode.readingTime} min</p>
      </section>

      {episode.isFree ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <StoryRender content={episode.content} />
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-amber-900">Fast Pass episode</h2>
          <p className="mt-2 text-sm text-amber-800">Unlock early access with credits. No subscription required—pay only when you want to read ahead.</p>
          <button className="mt-4 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white">Unlock early (mock)</button>
          <p className="mt-4 text-sm text-slate-700">Preview: {episode.excerpt}</p>
        </section>
      )}

      <nav className="flex flex-wrap items-center justify-between gap-3">
        {prev ? <Link href={`/series/${series.slug}/read/${prev.ep}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">← Episode {prev.ep}</Link> : <span />}
        {next ? <Link href={`/series/${series.slug}/read/${next.ep}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Episode {next.ep} →</Link> : <Link href={`/series/${series.slug}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Back to series</Link>}
      </nav>
    </div>
  );
}
