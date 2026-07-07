import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SeriesCard } from "@/components/SeriesCard";
import { getAllSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Read vertical webtoons and serialized stories",
  description:
    "Discover creator-owned webtoons, read free episodes, and unlock early access with credits.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: `${site.shortName} — Vertical stories for readers and creators`,
    description:
      "A creator-first platform for publishing, reading, and monetizing vertical webtoons and serialized stories.",
    url: absoluteUrl("/"),
  },
};

export default function HomePage() {
  const list = getAllSeries().slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.shortName,
    url: site.url,
    description: site.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/series?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="rounded-3xl border bg-white p-8 shadow-sm md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Reader app. Creator studio. Monetization engine.
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Vertical stories built for serious creators and obsessive readers.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          {site.shortName} is becoming a full webtoon platform: polished mobile reading, creator-owned publishing, early-access credits, and AI-assisted story development.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/series"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Browse series
          </Link>
          <Link
            href="/about"
            className="rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            How it works
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Trending now</h2>
            <p className="mt-2 text-sm text-slate-600">
              Early catalog examples while the full publishing platform is being built.
            </p>
          </div>
          <Link href="/series" className="text-sm font-medium hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {list.map((series) => (
            <SeriesCard key={series.slug} s={series} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border bg-slate-950 p-8 text-white shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">Creator access</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Creator onboarding is currently manual while the studio, upload flow, analytics, and revenue tooling are being built.
        </p>
        <a
          className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-100"
          href={`mailto:${site.creatorEmail}`}
        >
          Contact creators team
        </a>
      </section>
    </>
  );
}
