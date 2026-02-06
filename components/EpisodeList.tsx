// components/EpisodeList.tsx
import Link from "next/link";
import type { Series } from "@/lib/data";

export function EpisodeList({ series }: { series: Series }) {
  return (
    <ol className="mt-6 space-y-3">
      {series.episodes
        .slice()
        .sort((a, b) => a.ep - b.ep)
        .map((e) => (
          <li
            key={e.ep}
            className="rounded-2xl border border-neutral-200 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  Episode {e.ep}: {e.title}
                </p>
                <p className="mt-1 text-sm text-neutral-700">{e.excerpt}</p>
                <p className="mt-2 text-xs text-neutral-600">
                  {new Date(e.publishedAt).toLocaleDateString("en-GB")} ·{" "}
                  {e.isFree ? "Free" : "Fast Pass (paid)"}
                </p>
              </div>
              <Link
                href={`/series/${series.slug}/read/${e.ep}`}
                className="shrink-0 rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Read
              </Link>
            </div>
          </li>
        ))}
    </ol>
  );
}
