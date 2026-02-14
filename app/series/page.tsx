import type { Metadata } from "next";
import { SeriesCard } from "@/components/SeriesCard";
import { getAllSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Browse Series",
  description: "Explore the EU Webtoon library with free first episodes and early-access Fast Pass titles.",
  alternates: { canonical: absoluteUrl("/series") },
};

export default async function SeriesPage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = searchParams?.q?.trim().toLowerCase() || "";
  const all = await getAllSeries();
  const list = query
    ? all.filter((s) => [s.title, s.description, s.creatorName, s.genres.join(" "), s.tags.join(" ")].join(" ").toLowerCase().includes(query))
    : all;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="text-3xl font-semibold tracking-tight">Browse library</h1>
        <p className="mt-2 text-sm text-slate-600">Find your next read by genre, creator, language, or vibe.</p>
        <form className="mt-4 flex flex-wrap gap-2" action="/series" method="get">
          <input name="q" defaultValue={query} placeholder="Search title, genre, creator..." className="min-w-[260px] flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm" />
          <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Search</button>
        </form>
      </section>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((series) => (
          <SeriesCard key={series.slug} s={series} />
        ))}
      </section>
    </div>
  );
}
