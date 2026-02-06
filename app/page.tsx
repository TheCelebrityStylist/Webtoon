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

      <section style={{ display: "grid", gap: 16 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.4 }}>
          Read European webtoons and serialized stories
        </h1>
        <p style={{ maxWidth: 720, color: "#404040", lineHeight: 1.5 }}>
          Mobile-first vertical reading. Free episodes to start. Unlock early
          access (“Fast Pass”) via credits.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/series"
            style={{
              borderRadius: 14,
              background: "#111",
              color: "#fff",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Browse series
          </Link>
          <Link
            href="/about"
            style={{
              borderRadius: 14,
              border: "1px solid #d4d4d4",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            How it works
          </Link>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.2 }}>
          Trending now
        </h2>
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {list.map((s) => (
            <SeriesCard key={s.slug} s={s} />
          ))}
        </div>
      </section>

      <section
        style={{
          marginTop: 36,
          borderRadius: 18,
          border: "1px solid #e5e5e5",
          padding: 18,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
          For creators (MVP)
        </h2>
        <p style={{ marginTop: 8, fontSize: 14, color: "#404040", lineHeight: 1.5 }}>
          Publish serialized episodes. Earn revenue share on paid unlocks. In the
          MVP, onboarding is manual (email).
        </p>
        <p style={{ marginTop: 10, fontSize: 14 }}>
          Email:{" "}
          <a style={{ textDecoration: "underline" }} href="mailto:creators@yourdomain.com">
            creators@yourdomain.com
          </a>
        </p>
      </section>
    </>
  );
}
