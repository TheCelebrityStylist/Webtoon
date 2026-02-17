"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { SeriesCover } from "@/components/SeriesCover";
import type { Series } from "@/lib/types";

export function SeriesCard({ s }: { s: Series }) {
  const free = s.episodes.find((ep) => ep.isFree);

  return (
    <article className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <SeriesCover series={s} />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-indigo-700">{s.language.toUpperCase()}</span>
          {free ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Start free</span> : null}
        </div>
        <h3 className="text-lg font-semibold leading-tight tracking-tight text-slate-900">
          <Link href={`/series/${s.slug}`} onClick={() => trackEvent("series_card_click", { slug: s.slug })}>{s.title}</Link>
        </h3>
        <p className="text-sm text-slate-600">{s.hook}</p>
        <p className="text-xs text-slate-500">By {s.creatorName} · ⭐ {s.stats.ratingBeta.toFixed(2)} · {s.stats.readsBeta.toLocaleString()} reads</p>
        <div className="flex flex-wrap gap-2">
          {s.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="pill">#{tag}</span>
          ))}
        </div>
        <Link href={`/series/${s.slug}`} onClick={() => trackEvent("series_card_cta", { slug: s.slug })} className="cta-secondary px-4 py-2 text-xs">Continue series</Link>
      </div>
    </article>
  );
}
