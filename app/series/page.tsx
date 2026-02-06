// app/series/page.tsx
import type { Metadata } from "next";
import { getAllSeries } from "@/lib/data";
import { SeriesCard } from "@/components/SeriesCard";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Series",
  description:
    "Browse webtoon series and serialized stories. Find your next binge.",
  alternates: { canonical: absoluteUrl("/series") },
};

export default function SeriesIndexPage() {
  const list = getAllSeries();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Series</h1>
      <p className="mt-2 text-neutral-700">
        Browse vertical webtoons and serialized fiction.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((s) => (
          <SeriesCard key={s.slug} s={s} />
        ))}
      </div>
    </div>
  );
}
