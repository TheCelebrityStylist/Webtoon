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

  const ep = Number(params.ep);
  const episode = getEpisode(series, ep);
  if (!episode) return {};

  return {
    title: `${series.title} — Episode ${episode.ep}: ${episode.title}`,
    description: episode.excerpt,
    alternates: { canonical: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`) },
    robots: { index: episode.isFree, follow: true },
  };
}

export default async function ReaderPage({ params }: { params: { slug: string; ep: string } }) {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return notFound();

  const ep = Number(params.ep);
  const episode = getEpisode(series, ep);
  if (!episode) return notFound();

  const episodes = series.episodes.slice().sort((a, b) => a.ep - b.ep);
  const index = episodes.findIndex((item) => item.ep === episode.ep);
  const prev = index > 0 ? episodes[index - 1] : null;
  const next = index < episodes.length - 1 ? episodes[index + 1] : null;
  const progress = Math.round(((index + 1) / episodes.length) * 100);

  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Series", item: absoluteUrl("/series") },
            { "@type": "ListItem", position: 3, name: series.title, item: absoluteUrl(`/series/${series.slug}`) },
            { "@type": "ListItem", position: 4, name: `Episode ${episode.ep}`, item: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`) },
          ],
        }}
      />
      <div className="sticky top-16 z-30 rounded-xl border border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/series/${series.slug}`} className="text-sm font-semibold text-indigo-700">← Back to series</Link>
          <span className="text-xs text-slate-500">Episode {episode.ep}/{episodes.length} · {progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${progress}%` }} /></div>
      </div>

      <header className="section-shell">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">{series.title}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Episode {episode.ep}: {episode.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{new Date(episode.publishedAt).toLocaleDateString("en-GB")} · {episode.readingTime} min read</p>
      </header>

      {episode.isFree ? (
        <StoryRender content={episode.content} />
      ) : (
        <section className="section-shell border-amber-200 bg-amber-50">
          <h2 className="text-xl font-semibold text-amber-900">Fast Pass episode</h2>
          <p className="mt-2 text-sm text-amber-800">Unlock this episode with credits. No subscription required. Choose unlocks only when you want early access.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <button className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900">10 credits · €4.99</button>
            <button className="rounded-xl border-2 border-indigo-500 bg-white px-3 py-2 text-sm font-semibold text-slate-900">30 credits · €12.99</button>
            <button className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900">80 credits · €29.99</button>
          </div>
          <button className="cta-primary mt-4">Unlock now (mock)</button>
          <p className="mt-4 text-sm text-slate-700">Preview: {episode.excerpt}</p>
        </section>
      )}

      <nav className="flex flex-wrap items-center justify-between gap-2">
        {prev ? <Link href={`/series/${series.slug}/read/${prev.ep}`} className="cta-secondary px-4 py-2 text-xs">← Episode {prev.ep}</Link> : <span />}
        {next ? <Link href={`/series/${series.slug}/read/${next.ep}`} className="cta-primary px-4 py-2 text-xs">Episode {next.ep} →</Link> : <Link href={`/series/${series.slug}`} className="cta-primary px-4 py-2 text-xs">Back to series</Link>}
      </nav>
    </div>
  );
}
