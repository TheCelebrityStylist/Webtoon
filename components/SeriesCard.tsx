import Image from "next/image";
import Link from "next/link";
import type { Series } from "@/lib/types";

export function SeriesCard({ s }: { s: Series }) {
  const freeEpisode = s.episodes.find((ep) => ep.isFree);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image src={s.coverUrl} alt={s.coverAlt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-indigo-700">
          <span>{s.language.toUpperCase()}</span>
          {freeEpisode ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Read free</span> : null}
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          <Link href={`/series/${s.slug}`}>{s.title}</Link>
        </h3>
        <p className="text-sm text-slate-600">{s.logline}</p>
        <p className="text-xs text-slate-500">By {s.creatorName}</p>
        <div className="flex flex-wrap gap-2">
          {s.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">#{tag}</span>
          ))}
        </div>
        <Link href={`/series/${s.slug}`} className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">
          View series
        </Link>
      </div>
    </article>
  );
}
