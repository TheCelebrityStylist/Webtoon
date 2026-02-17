import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EpisodeList } from "@/components/EpisodeList";
import { JsonLd } from "@/components/JsonLd";
import { SeriesCard } from "@/components/SeriesCard";
import { ARC_DEFINITIONS, buildMockReaderProgress, getArcPassCost } from "@/lib/progression";
import { getAllSeries, getSeriesBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) return {};

  return {
    title: `${series.title} | EU Webtoon`,
    description: series.description,
    alternates: { canonical: absoluteUrl(`/series/${series.slug}`) },
    openGraph: {
      title: series.title,
      description: series.description,
      url: absoluteUrl(`/series/${series.slug}`),
      images: [absoluteUrl(series.coverUrl)],
    },
  };
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const [series, all] = await Promise.all([getSeriesBySlug(slug), getAllSeries()]);
  if (!series) return notFound();

  const firstFree = series.episodes.find((e) => e.isFree);
  const similar = all.filter((item) => item.slug !== series.slug && item.genres.some((g) => series.genres.includes(g))).slice(0, 6);
  const progress = buildMockReaderProgress(series, Math.min(5, series.episodes.length));
  const activeArc = ARC_DEFINITIONS.find((a) => a.key === progress.active_arc) ?? ARC_DEFINITIONS[0];

  return (
    <div className="space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWorkSeries",
          name: series.title,
          description: series.longDescription,
          inLanguage: series.language,
          url: absoluteUrl(`/series/${series.slug}`),
          genre: series.genres,
        }}
      />

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-[280px_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
          <Image src={series.coverUrl} alt={series.coverAlt} fill sizes="(max-width:768px) 100vw, 280px" className="object-cover" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">{series.language.toUpperCase()} · {series.genres.join(" · ")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{series.title}</h1>
          <p className="mt-1 text-sm text-slate-500">By {series.creatorName}</p>
          <p className="mt-4 text-sm text-slate-700">{series.hook}</p>

          <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Next Episode Drops in</p>
              <p className="mt-1 text-lg font-bold text-slate-900">2d 06h 14m</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Early Access Available</p>
              <p className="mt-1 text-sm font-semibold text-indigo-700">Unlock now with Arc Pass</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Free Episodes Remaining</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">2</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Arc Completion</p>
              <p className="mt-1 text-lg font-bold text-slate-900">72%</p>
              <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-indigo-600" style={{ width: "72%" }} /></div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">Active continuity lane</p>
            <p className="mt-1 text-sm font-semibold text-amber-900">{activeArc.label} · {progress.arc_completion_percent}% complete</p>
            <p className="mt-1 text-sm text-amber-800">Waiting breaks your active arc continuity and removes bonus POV scenes.</p>
            <p className="mt-1 text-sm text-amber-800">Spoiler risk score: {progress.spoiler_risk_score}/100 · Bonus scenes expire in 48h.</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/series/${series.slug}/read/${firstFree?.ep ?? 1}`} className="cta-primary">Start reading free</Link>
            <Link href="/pricing" className="cta-secondary">Unlock Arc Pass ({getArcPassCost(activeArc.key)} credits)</Link>
          </div>
          <p className="mt-3 text-xs text-slate-600">Unlocking supports the creator directly. Your unlock funds the next episode.</p>
        </div>
      </section>

      <section className="section-shell rounded-2xl border border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-semibold tracking-tight">Arc roadmap</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ARC_DEFINITIONS.map((arc) => (
            <article key={arc.key} className={`rounded-xl border p-3 ${arc.key === activeArc.key ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <p className="text-sm font-semibold">{arc.label}</p>
              <p className="mt-1 text-xs text-slate-600">Episodes {arc.startEp}–{arc.endEp}</p>
              <p className="mt-2 text-sm text-slate-700">{arc.tensionHook}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Episodes</h2>
        <p className="mt-1 text-sm text-slate-600">Unlock arcs to maintain momentum, keep streak bonuses, and keep bonus scenes active.</p>
        <div className="mt-4">
          <EpisodeList series={series} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Continue now in another continuity lane</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {similar.map((item) => <SeriesCard key={item.slug} s={item} />)}
        </div>
      </section>

      <Link href={`/series/${series.slug}/read/${firstFree?.ep ?? 1}`} className="fixed bottom-20 left-4 right-4 z-40 rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg md:hidden">
        Continue active arc
      </Link>
    </div>
  );
}
