"use client";

import { useMemo, useState } from "react";
import { SeriesCard } from "@/components/SeriesCard";
import type { Series } from "@/lib/types";

function unique(values: string[]) {
  return Array.from(new Set(values)).sort();
}

export function SeriesExplorer({ initial }: { initial: Series[] }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [language, setLanguage] = useState("all");
  const [tag, setTag] = useState("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [hasFastPass, setHasFastPass] = useState(false);
  const [sort, setSort] = useState<"trending" | "new" | "rating">("trending");

  const genres = useMemo(() => unique(initial.flatMap((item) => item.genres)), [initial]);
  const languages = useMemo(() => unique(initial.map((item) => item.language.toUpperCase())), [initial]);
  const tags = useMemo(() => unique(initial.flatMap((item) => item.tags)), [initial]);

  const filtered = useMemo(() => {
    const base = initial.filter((item) => {
      if (genre !== "all" && !item.genres.includes(genre)) return false;
      if (language !== "all" && item.language.toUpperCase() !== language) return false;
      if (tag !== "all" && !item.tags.includes(tag)) return false;
      if (freeOnly && !item.episodes.some((ep) => ep.isFree)) return false;
      if (hasFastPass && !item.episodes.some((ep) => ep.fastPass)) return false;
      if (query) {
        const hay = `${item.title} ${item.description} ${item.tags.join(" ")} ${item.creatorName}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });

    if (sort === "new") return base.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    if (sort === "rating") return base.slice().sort((a, b) => b.stats.ratingBeta - a.stats.ratingBeta);
    return base.slice().sort((a, b) => b.stats.readsBeta - a.stats.readsBeta);
  }, [initial, genre, language, tag, freeOnly, hasFastPass, query, sort]);

  return (
    <div className="space-y-4">
      <div className="section-shell space-y-3">
        <div className="grid gap-2 md:grid-cols-6">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, creator, vibe" className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All genres</option>
            {genres.map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All languages</option>
            {languages.map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All tags</option>
            {tags.map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as "trending" | "new" | "rating")} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="trending">Sort: Trending</option>
            <option value="new">Sort: New</option>
            <option value="rating">Sort: Rating</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
            Free to start
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={hasFastPass} onChange={(e) => setHasFastPass(e.target.checked)} />
            Fast Pass available
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="section-shell text-sm text-slate-600">No series match this filter set yet. Try clearing one filter.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => <SeriesCard key={item.slug} s={item} />)}
        </div>
      )}

      <section className="section-shell">
        <h2 className="text-xl font-semibold">European webtoons explained</h2>
        <p className="mt-2 text-sm text-slate-600">
          European webtoons often combine regional settings, multilingual dialogue texture, and creator-led visual identity. On EU Webtoon, every launch supports free-first onboarding, then optional Fast Pass credits for early chapters. Explore romance, mystery, fantasy, and slice-of-life categories through clean indexable URLs that support search and sharing.
        </p>
      </section>
    </div>
  );
}
