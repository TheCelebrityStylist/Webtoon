"use client";

import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { Series } from "@/lib/types";

export function SeriesCard({ s }: { s: Series }) {
  const free = s.episodes.find((ep) => ep.isFree);

  return (
    <article className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[3/4] w-full">
        <Image src={s.coverUrl} alt={s.coverAlt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-indigo-700">{s.language.toUpperCase()}</span>
          {free ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Start free</span> : null}
        </div>
        <h3 className="text-lg font-semibold leading-tight tracking-tight text-slate-900">
          <Link href={`/series/${s.slug}`} onClick={() => trackEvent("series_card_click", { slug: s.slug })}>{s.title}</Link>
        </h3>
        <p className="text-sm text-slate-600">{s.logline}</p>
        <p className="text-xs text-slate-500">By {s.creatorName} · ⭐ {s.stats.betaRating.toFixed(2)} · {s.stats.betaReads.toLocaleString()} beta reads</p>
        <div className="flex flex-wrap gap-2">
          {s.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="pill">#{tag}</span>
          ))}
        </div>
        <Link href={`/series/${s.slug}`} onClick={() => trackEvent("series_card_cta", { slug: s.slug })} className="cta-secondary px-4 py-2 text-xs">Read series</Link>
      </div>
    </article>
  );
}
