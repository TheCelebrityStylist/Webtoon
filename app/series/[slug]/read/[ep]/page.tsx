import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { StoryRender } from "@/components/StoryRender";
import { buildMockReaderProgress, getArcForEpisode, getArcPassCost, getEpisodeLockState } from "@/lib/progression";
import { getEpisode, getSeriesBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string; ep: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, ep } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) return {};

  const epNum = Number(ep);
  const episode = await getEpisode(series.slug, epNum);
  if (!episode) return {};

  return {
    title: `${series.title} — Episode ${episode.ep}: ${episode.title}`,
    description: episode.excerpt,
    alternates: { canonical: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`) },
    robots: { index: episode.isFree, follow: true },
  };
}

export default async function ReaderPage({ params }: Props) {
  const { slug, ep } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) return notFound();

  const epNum = Number(ep);
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
  const showCliffhangerLock = !next || nextState === "cliffhanger_locked" || nextState === "arc_locked";

  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Series", item: absoluteUrl("/webtoons") },
            { "@type": "ListItem", position: 3, name: series.title, item: absoluteUrl(`/series/${series.slug}`) },
            { "@type": "ListItem", position: 4, name: `Episode ${episode.ep}`, item: absoluteUrl(`/series/${series.slug}/read/${episode.ep}`) },
          ],
        }}
      />

      <div className="sticky top-16 z-30 rounded-xl border border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/series/${series.slug}`} className="text-sm font-semibold text-indigo-700">← Back to series</Link>
          <span className="text-xs text-slate-500">Episode {episode.ep}/{episodes.length} · {progress}% complete</span>
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
          <h2 className="text-xl font-semibold text-amber-900">Arc is locked</h2>
          <p className="mt-2 text-sm text-amber-800">Arc tension peaks in the next episode. Continue with Arc Pass to maintain your active continuity lane.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            <button className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900">Starter Arc Pass · 1 Arc · €4.99</button>
            <button className="rounded-xl border-2 border-indigo-500 bg-white px-3 py-2 text-sm font-semibold text-slate-900">Reader Arc Pass · 3 Arcs · €12.99</button>
            <button className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900">Binge Arc Pass · 8 Arcs · €29.99</button>
            <button className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900">Completion Pass · Full Season · €59.99</button>
          </div>
          <button className="cta-primary mt-4">Unlock Arc ({getArcPassCost(activeArc.key)} credits)</button>
          <p className="mt-3 text-sm text-slate-700">Unlocking supports the creator directly. Your unlock funds the next episode.</p>
          <p className="mt-2 text-sm text-slate-700">Preview: {episode.excerpt}</p>
        </section>
      )}

      <section className="section-shell rounded-2xl border border-rose-200 bg-rose-50">
        <h3 className="text-lg font-semibold text-rose-900">Your arc will expire</h3>
        <p className="mt-2 text-sm text-rose-800">
          Waiting moves this series out of your active continuity lane. Bonus scenes and character POV extras will no longer unlock automatically.
        </p>
        <p className="mt-2 text-sm text-rose-800">Streak reset risk: high · Spoiler risk score: {reader.spoiler_risk_score}/100 · Arc expiry countdown: 47h 21m</p>
      </section>

      {showCliffhangerLock ? (
        <section className="section-shell rounded-2xl border border-amber-300 bg-amber-50">
          <h2 className="text-xl font-semibold text-amber-900">Continue now</h2>
          <p className="mt-1 text-sm text-amber-900">Arc tension peaks in the next episode.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
            <li>Waiting breaks your active arc</li>
            <li>Bonus scene expires in 48h</li>
            <li>Readers who unlocked are 72% more likely to finish the story</li>
          </ul>
          <button className="cta-primary mt-4">Unlock Arc ({getArcPassCost(activeArc.key)} credits)</button>
        </section>
      ) : null}

      <section className="section-shell rounded-2xl border border-slate-200 bg-slate-50">
        <h2 className="text-xl font-semibold tracking-tight">Next Episode: Locked</h2>
        <p className="mt-2 text-sm text-slate-700">Continue now with 3 Arc Pass credits</p>
        <p className="mt-1 text-sm text-slate-700">Release: Public in 5 days</p>
        <p className="mt-1 text-sm text-slate-700">Reading Streak: {reader.reading_streak} weeks</p>
        <p className="mt-1 text-sm font-medium text-indigo-700">Maintain streak by unlocking early</p>
        <p className="mt-1 text-sm text-slate-700">Continuity bonus: {reader.continuity_bonus}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {next ? <Link href={`/series/${series.slug}/read/${next.ep}`} className="cta-primary px-4 py-2 text-xs">Continue now</Link> : <Link href={`/series/${series.slug}`} className="cta-primary px-4 py-2 text-xs">Finish arc</Link>}
          <Link href="/pricing" className="cta-secondary px-4 py-2 text-xs">Get Arc Pass</Link>
        </div>
      </section>

      <nav className="flex flex-wrap items-center justify-between gap-2">
        {prev ? <Link href={`/series/${series.slug}/read/${prev.ep}`} className="cta-secondary px-4 py-2 text-xs">← Episode {prev.ep}</Link> : <span />}
        {next ? <Link href={`/series/${series.slug}/read/${next.ep}`} className="cta-primary px-4 py-2 text-xs">Episode {next.ep} →</Link> : <Link href={`/series/${series.slug}`} className="cta-primary px-4 py-2 text-xs">Back to series</Link>}
      </nav>
    </div>
  );
}
