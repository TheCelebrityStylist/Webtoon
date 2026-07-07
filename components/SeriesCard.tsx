// components/SeriesCard.tsx
import Link from "next/link";
import type { Series } from "@/lib/data";

export function SeriesCard({ s }: { s: Series }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="h-36 w-full"
        style={{
          background: `linear-gradient(135deg, ${s.cover.bgFrom}, ${s.cover.bgTo})`,
        }}
      />
      <div className="p-5">
        <h3 className="text-lg font-semibold tracking-tight">
          <Link href={`/series/${s.slug}`} className="hover:underline">
            {s.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-neutral-700">{s.tagline}</p>
        <p className="mt-2 text-xs text-neutral-600">
          {s.tags.join(" · ")} · {s.language.toUpperCase()} · by {s.author}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs text-neutral-500">
            {s.episodes.length} episode{s.episodes.length === 1 ? "" : "s"}
          </span>
          <Link
            href={`/series/${s.slug}`}
            className="inline-flex rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
          >
            View series
          </Link>
        </div>
      </div>
    </article>
  );
}
