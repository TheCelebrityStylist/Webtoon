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
    <div className="stack" style={{ gap: "40px" }}>
      <JsonLd data={jsonLd} />

      <section className="hero">
        <h1 className="hero-title">Read European webtoons and serialized stories</h1>
        <p className="hero-subtitle">
          Mobile-first vertical reading. Free episodes to start. Unlock early access via
          credits with Fast Pass.
        </p>
        <div className="hero-actions">
          <Link href="/series" className="button button-primary">
            Browse series
          </Link>
          <Link href="/about" className="button button-secondary">
            How it works
          </Link>
        </div>
        <div className="hero-proof">
          <span>New: European creators</span>
          <span>•</span>
          <span>Mobile-first</span>
          <span>•</span>
          <span>Fast Pass credits</span>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Trending now</h2>
        <div className="grid grid-2">
          {list.map((s) => (
            <SeriesCard key={s.slug} s={s} />
          ))}
        </div>
      </section>

      <section className="section surface">
        <h2 className="section-title">How Fast Pass works</h2>
        <div className="grid grid-2">
          {[
            {
              title: "Start free",
              copy: "Read free episodes instantly and follow series you love.",
            },
            {
              title: "Use credits",
              copy: "Unlock upcoming episodes early with credits when you want more.",
            },
            {
              title: "Stay ahead",
              copy: "Binge the latest drops and keep your streak going.",
            },
          ].map((item) => (
            <div key={item.title} className="card">
              <h3 style={{ marginTop: 0 }}>{item.title}</h3>
              <p style={{ margin: 0, color: "#4b5563" }}>{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section surface">
        <div className="grid grid-2">
          <div className="stack">
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              For creators (MVP)
            </h2>
            <p style={{ margin: 0, color: "#4b5563" }}>
              Publish serialized episodes, grow superfans, and earn revenue share on paid
              unlocks.
            </p>
            <ul className="list">
              <li>Weekly featured slots for top-performing series.</li>
              <li>Fast Pass revenue split with transparent analytics.</li>
              <li>Support for vertical-first storytelling.</li>
            </ul>
          </div>
          <div className="stack" style={{ justifyContent: "center" }}>
            <p style={{ margin: 0, color: "#4b5563" }}>
              Creator onboarding is invite-only during the MVP.
            </p>
            <Link
              href="mailto:creators@yourdomain.com"
              className="button button-primary"
              style={{ alignSelf: "flex-start" }}
            >
              Email creators@yourdomain.com
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
