import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EpisodePaywall } from "@/components/EpisodePaywall";
import { JsonLd } from "@/components/JsonLd";
import { StoryRender } from "@/components/StoryRender";
import { buildMockReaderProgress, getArcForEpisode, getArcPassCost, getEpisodeLockState } from "@/lib/progression";
import { getEpisode, getSeriesBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string; ep: string } }): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return {};

  const epNum = Number(params.ep);
  const episode = await getEpisode(series.slug, epNum);
  if (!episode) return {};

  return {
    title: `${series.title} — Episode ${episode.ep}: ${episode.title}`,
    description: episode.excerpt,
    alternates: { canonical: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`) },
    robots: { index: episode.isFree, follow: true },
  };
}

function teaserFromContent(content: string, words = 420): string {
  const list = content.split(/\s+/).slice(0, words);
  return `${list.join(" ")}\n\n…unlock to continue.`;
}

export default async function ReaderPage({ params }: { params: { slug: string; ep: string } }) {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return notFound();

  const epNum = Number(params.ep);
  const episode = await getEpisode(series.slug, epNum);
  if (!episode) return notFound();

  const episodes = series.episodes.slice().sort((a, b) => a.ep - b.ep);
  const index = episodes.findIndex((item) => item.ep === episode.ep);
  const prev = index > 0 ? episodes[index - 1] : null;
  const next = index < episodes.length - 1 ? episodes[index + 1] : null;
  const progress = Math.round(((index + 1) / episodes.length) * 100);
  const reader = buildMockReaderProgress(series, episode.ep);
  const activeArc = getArcForEpisode(episode.ep);
  const nextState = next ? getEpisodeLockState(next) : "free";

  const bonusTitles = [
    "POV: The message Jonas never sent",
    "Creator commentary: why this reveal lands here",
    "Extended panel: canal lock confrontation",
  ];

  return (
    <div className="space-y-6 pb-28">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Webtoons", item: absoluteUrl("/webtoons") },
            { "@type": "ListItem", position: 3, name: series.title, item: absoluteUrl(`/series/${series.slug}`) },
            { "@type": "ListItem", position: 4, name: `Episode ${episode.ep}`, item: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`) },
          ],
        }}
      />

      <div className="sticky top-16 z-30 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/series/${series.slug}`} className="text-sm font-semibold text-indigo-700">← Back to series</Link>
          <span className="text-xs text-slate-500">Episode {episode.ep}/{episodes.length} · {progress}% complete</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${progress}%` }} /></div>
      </div>

      <header className="section-shell">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">{series.title}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Episode {episode.ep}: {episode.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{new Date(episode.publishedAt).toLocaleDateString("en-GB")} · {episode.readingTime} min read</p>
      </header>

      {episode.isFree ? <StoryRender content={episode.content} /> : <EpisodePaywall seriesSlug={series.slug} episodeNumber={episode.ep} teaser={teaserFromContent(episode.content)} bonusTitles={bonusTitles} />}

      {nextState !== "free" ? (
        <section className="section-shell rounded-2xl border border-rose-200 bg-rose-50">
          <h3 className="text-lg font-semibold text-rose-900">Your arc will expire</h3>
          <p className="mt-2 text-sm text-rose-800">Waiting moves this series out of your Continuity Lane. Bonus scenes and character POV extras will no longer unlock automatically.</p>
          <p className="mt-2 text-sm text-rose-800">Streak reset risk: high · Spoiler risk score: {reader.spoiler_risk_score}/100 · Arc expiry countdown: 47h 21m</p>
        </section>
      ) : null}

      <section className="section-shell rounded-2xl border border-slate-200 bg-slate-50">
        <h2 className="text-xl font-semibold tracking-tight">Next Episode: {nextState === "free" ? "Free" : "Locked"}</h2>
        <p className="mt-2 text-sm text-slate-700">Continue now with 3 credits or use Continuity+ monthly perks.</p>
        <p className="mt-1 text-sm text-slate-700">Release: Public in 5 days · Reading Streak: {reader.reading_streak} weeks</p>
        <p className="mt-1 text-sm font-medium text-indigo-700">Maintain streak by unlocking early</p>
        <p className="mt-1 text-sm text-slate-700">Continuity bonus: {reader.continuity_bonus}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {next ? <Link href={`/series/${series.slug}/read/${next.ep}`} className="cta-primary px-4 py-2 text-xs">Continue now</Link> : <Link href={`/series/${series.slug}`} className="cta-primary px-4 py-2 text-xs">Finish arc</Link>}
          <Link href="/pricing" className="cta-secondary px-4 py-2 text-xs">Get credits</Link>
          <button className="cta-secondary px-4 py-2 text-xs">Unlock Arc ({getArcPassCost(activeArc.key)} credits)</button>
        </div>
      </section>

      <nav className="flex flex-wrap items-center justify-between gap-2">
        {prev ? <Link href={`/series/${series.slug}/read/${prev.ep}`} className="cta-secondary px-4 py-2 text-xs">← Episode {prev.ep}</Link> : <span />}
        {next ? <Link href={`/series/${series.slug}/read/${next.ep}`} className="cta-primary px-4 py-2 text-xs">Episode {next.ep} →</Link> : <Link href={`/series/${series.slug}`} className="cta-primary px-4 py-2 text-xs">Back to series</Link>}
      </nav>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg md:hidden dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl gap-2">
          <Link href="/pricing" className="cta-secondary flex-1 justify-center">Continuity+</Link>
          <button className="cta-primary flex-1 justify-center">Continue now (3 credits)</button>
        </div>
      </div>
    </div>
  );
}
