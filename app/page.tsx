// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { getAllSeries } from "@/lib/data";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";
import { SeriesCard } from "@/components/SeriesCard";

export const metadata: Metadata = {
  title: "Read European webtoons and serialized stories",
  description:
    "Discover new creators, read free episodes, and unlock early access via credits. Vertical-first webtoons and serialized fiction.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "EU Webtoon — Read European webtoons",
    description:
      "Discover new creators, read free episodes, and unlock early access via credits.",
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
      <section className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Read European webtoons and serialized stories
        </h1>
        <p className="max-w-2xl text-neutral-700">
          Mobile-first vertical reading. Free episodes to start. Unlock early
          access (“Fast Pass”) via credits.
        </p>

        <div className="flex gap-3">
          <Link
            href="/series"
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Browse series
          </Link>
          <Link
            href="/about"
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            How it works
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Trending now</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {list.map((s) => (
            <SeriesCard key={s.slug} s={s} />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          For creators (MVP)
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          Publish serialized episodes. Earn revenue share on paid unlocks. In the
          MVP, onboarding is manual (email).
        </p>
        <p className="mt-3 text-sm">
          Email:{" "}
          <a className="underline" href="mailto:creators@yourdomain.com">
            creators@yourdomain.com
          </a>
        </p>
      </section>
    </>
  );
}
