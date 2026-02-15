"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { Series } from "@/lib/types";

export function EpisodeList({ series }: { series: Series }) {
  return (
    <ol className="space-y-3">
      {series.episodes
        .slice()
        .sort((a, b) => a.ep - b.ep)
        .map((episode) => (
          <li key={episode.ep} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Episode {episode.ep}: {episode.title}</p>
                <p className="mt-1 text-sm text-slate-600">{episode.excerpt}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{new Date(episode.publishedAt).toLocaleDateString("en-GB")}</span>
                  <span>·</span>
                  <span>{episode.readingTime} min</span>
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${episode.isFree ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {episode.isFree ? "Free" : "Fast Pass"}
                  </span>
                </div>
              </div>
              <Link href={`/series/${series.slug}/read/${episode.ep}`} className="cta-primary px-4 py-2 text-xs" onClick={() => trackEvent("episode_start_click", { slug: series.slug, ep: episode.ep })}>
                {episode.isFree ? "Start reading" : "Unlock episode"}
              </Link>
            </div>
          </li>
        ))}
    </ol>
  );
}
