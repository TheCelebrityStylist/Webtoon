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
    <div className="page">
      <section className="hero" style={{ padding: "32px" }}>
        <div className="stack">
          <p className="tagline" style={{ margin: 0 }}>
            Browse the library
          </p>
          <h1 className="heroTitle" style={{ fontSize: "2.25rem" }}>
            Series
          </h1>
          <p className="heroSubtitle">
            Browse vertical webtoons and serialized fiction from European creators.
          </p>
        </div>
      </section>

      <form className="card searchForm" action="/series" method="get">
        <div className="formRow">
          <label htmlFor="series-search" className="formField">
            Search series
            <span className="formHint">Search by title, genre, or creator.</span>
          </label>
          <div className="inputGroup">
            <input
              id="series-search"
              name="q"
              defaultValue={query}
              placeholder="Try “mystery”, “romance”, or a creator name"
              className="input"
            />
            <button className="btn btnPrimary" type="submit">
              Search
            </button>
          </div>
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
