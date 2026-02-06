// app/series/page.tsx
import type { Metadata } from "next";
import { getAllSeries } from "@/lib/data";
import { SeriesCard } from "@/components/SeriesCard";
import { absoluteUrl } from "@/lib/seo";

type Props = {
  searchParams?: {
    q?: string;
  };
};

export const metadata: Metadata = {
  title: "Series",
  description: "Browse webtoon series and serialized stories. Find your next binge.",
  alternates: { canonical: absoluteUrl("/series") },
};

export default async function SeriesIndexPage({ searchParams }: Props) {
  const query = searchParams?.q?.trim() ?? "";
  const list = (await getAllSeries()).filter((series) => {
    if (!query) return true;
    const haystack = [
      series.title,
      series.logline,
      series.description,
      series.genres.join(" "),
      series.creatorName,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="stack" style={{ gap: "32px" }}>
      <section className="stack">
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Series</h1>
        <p style={{ color: "#4b5563", margin: 0 }}>
          Browse vertical webtoons and serialized fiction from European creators.
        </p>
      </section>

      <form className="card" action="/series" method="get">
        <label htmlFor="series-search" style={{ fontWeight: 600 }}>
          Search series
        </label>
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <input
            id="series-search"
            name="q"
            defaultValue={query}
            placeholder="Search by title, genre, or creator"
            style={{
              flex: 1,
              borderRadius: "999px",
              border: "1px solid #e2e8f0",
              padding: "10px 14px",
              fontSize: "0.95rem",
            }}
          />
          <button className="btn btnPrimary" type="submit">
            Search
          </button>
        </div>
      </form>

      <section className="section">
        <div className="grid gridCards">
          {list.map((s) => (
            <SeriesCard key={s.slug} s={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
