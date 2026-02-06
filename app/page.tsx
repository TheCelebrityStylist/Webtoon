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
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <JsonLd data={jsonLd} />
      <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 600, margin: 0 }}>
          Read European webtoons and serialized stories
        </h1>
        <p style={{ maxWidth: "640px", color: "#4b5563", margin: 0 }}>
          Mobile-first vertical reading. Free episodes to start. Unlock early
          access (“Fast Pass”) via credits.
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/series"
            style={{
              borderRadius: "12px",
              background: "#111111",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#ffffff",
              display: "inline-flex",
            }}
          >
            Browse series
          </Link>
          <Link
            href="/about"
            style={{
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              padding: "10px 16px",
              fontSize: "14px",
              display: "inline-flex",
            }}
          >
            How it works
          </Link>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
          Trending now
        </h2>
        <div
          style={{
            marginTop: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {list.map((s) => (
            <SeriesCard key={s.slug} s={s} />
          ))}
        </div>
      </section>

      <section
        style={{
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          background: "#ffffff",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
          For creators (MVP)
        </h2>
        <p style={{ marginTop: "8px", fontSize: "14px", color: "#4b5563" }}>
          Publish serialized episodes. Earn revenue share on paid unlocks. In the
          MVP, onboarding is manual (email).
        </p>
        <p style={{ marginTop: "12px", fontSize: "14px" }}>
          Email:{" "}
          <a style={{ textDecoration: "underline" }} href="mailto:creators@yourdomain.com">
            creators@yourdomain.com
          </a>
        </p>
      </section>
    </div>
  );
}
