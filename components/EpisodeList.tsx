import Link from "next/link";
import type { Series } from "@/lib/types";

export function EpisodeList({ series }: { series: Series }) {
  const sorted = series.episodes.slice().sort((a, b) => a.ep - b.ep);

  return (
    <ol className="space-y-3">
      {sorted.map((episode) => (
        <li key={episode.ep} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">Episode {episode.ep}: {episode.title}</p>
              <p className="mt-1 text-sm text-slate-600">{episode.excerpt}</p>
              <p className="mt-2 text-xs text-slate-500">
                {new Date(episode.publishedAt).toLocaleDateString("en-GB")} · {episode.readingTime} min · {episode.isFree ? "Free" : "Fast Pass"}
              </p>
            </div>
            <Link href={`/series/${series.slug}/read/${episode.ep}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              {episode.isFree ? "Read now" : "Unlock early"}
            </Link>
          </div>
        </li>
      ))}
    </ol>
  );
}
