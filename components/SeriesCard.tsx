// components/SeriesCard.tsx
import Link from "next/link";
import type { Series } from "@/lib/data";

export function SeriesCard({ s }: { s: Series }) {
  return (
    <article className="rounded-2xl border border-neutral-200 p-5 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight">
        <Link href={`/series/${s.slug}`} className="hover:underline">
          {s.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-neutral-700">{s.logline}</p>
      <p className="mt-2 text-xs text-neutral-600">
        {s.genres.join(" · ")} · {s.language.toUpperCase()} · by {s.creatorName}
      </p>
      <div className="mt-4">
        <Link
          href={`/series/${s.slug}`}
          className="inline-flex rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
        >
          View series
        </Link>
      </div>
    </article>
  );
}
