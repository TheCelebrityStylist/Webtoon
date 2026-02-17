"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { getArcForEpisode, getEpisodeLockState } from "@/lib/progression";
import type { Series } from "@/lib/types";

const lockLabel: Record<string, string> = {
  free: "Free",
  progress_locked: "Progress locked",
  cliffhanger_locked: "Cliffhanger locked",
  arc_locked: "Arc locked",
  bonus_locked: "Bonus locked",
  spoiler_risk: "Spoiler risk",
  streak_break_risk: "Streak break risk",
};

export function EpisodeList({ series }: { series: Series }) {
  return (
    <ol className="space-y-3">
      {series.episodes
        .slice()
        .sort((a, b) => a.ep - b.ep)
        .map((episode) => {
          const arc = getArcForEpisode(episode.ep);
          const state = episode.lockState ?? getEpisodeLockState(episode);

          return (
            <li key={episode.ep} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">{arc.label}</p>
                  <p className="text-sm font-semibold text-slate-900">Episode {episode.ep}: {episode.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{episode.excerpt}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{new Date(episode.publishedAt).toLocaleDateString("en-GB")}</span>
                    <span>·</span>
                    <span>{episode.readingTime} min</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${state === "free" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {lockLabel[state]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/series/${series.slug}/read/${episode.ep}`} className="cta-primary px-4 py-2 text-xs" onClick={() => trackEvent("episode_start_click", { slug: series.slug, ep: episode.ep, state })}>
                    {state === "free" ? "Start reading" : "Unlock Arc"}
                  </Link>
                  {state !== "free" ? <span className="text-xs text-slate-500">Waiting can break your active arc continuity.</span> : null}
                </div>
              </div>
            </li>
          );
        })}
    </ol>
  );
}
