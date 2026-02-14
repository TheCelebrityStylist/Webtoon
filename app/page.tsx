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

export default async function HomePage() {
  const list = (await getAllSeries()).slice(0, 6);

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
    <div className="page">
      <JsonLd data={jsonLd} />

      <section className="hero">
        <div className="heroGrid">
          <div className="stack">
            <p className="tagline" style={{ margin: 0 }}>
              Discover European originals
            </p>
            <h1 className="heroTitle">Read European webtoons and serialized stories</h1>
            <p className="heroSubtitle">
              Mobile-first vertical reading. Free episodes to start. Unlock early access
              via credits with Fast Pass.
            </p>
            <div className="heroActions">
              <Link href="/series" className="btn btnPrimary">
                Browse series
              </Link>
              <Link href="/ai-stylist" className="btn btnGhost">
                Try AI Studio
              </Link>
            </div>
            <div className="heroMeta">
              <span>Curated new drops weekly</span>
              <span>•</span>
              <span>Fast Pass rewards creators</span>
              <span>•</span>
              <span>Optimized for mobile</span>
            </div>
          </div>
          <div className="heroMedia" aria-hidden="true" />
        </div>
        <div className="heroStats">
          {[
            { title: "120K+", copy: "Monthly reads across the EU." },
            { title: "4.9/5", copy: "Average reader rating." },
            { title: "30+", copy: "Creator partners onboarded." },
          ].map((stat) => (
            <div key={stat.title} className="statCard">
              <strong>{stat.title}</strong>
              <p style={{ margin: "4px 0 0" }}>{stat.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="stack">
          <h2 className="sectionTitle">Trending now</h2>
          <p className="sectionLead">
            Our editorial team highlights the most binge-worthy European launches.
          </p>
        </div>
        <div className="grid gridCards" style={{ marginTop: "24px" }}>
          {list.map((s) => (
            <SeriesCard key={s.slug} s={s} />
          ))}
        </div>
      </section>

      <section className="section surface">
        <div className="stack">
          <p className="tagline" style={{ margin: 0 }}>
            Fast Pass
          </p>
          <h2 className="sectionTitle">How Fast Pass works</h2>
          <p className="sectionLead">
            Unlock future episodes early and help your favorite creators earn more.
          </p>
        </div>
        <div className="grid gridCards" style={{ marginTop: "24px" }}>
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
              <p style={{ margin: 0, color: "var(--muted)" }}>{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section surface">
        <div className="grid gridCards">
          <div className="stack">
            <p className="tagline" style={{ margin: 0 }}>
              For creators
            </p>
            <h2 className="sectionTitle" style={{ marginBottom: 0 }}>
              Launch your series with EU Webtoon
            </h2>
            <p style={{ margin: 0, color: "var(--muted)" }}>
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
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Creator onboarding</h3>
              <p style={{ margin: 0, color: "var(--muted)" }}>
                Creator onboarding is invite-only during the MVP. Reach out to apply.
              </p>
              <Link
                href="mailto:creators@yourdomain.com"
                className="btn btnPrimary"
                style={{ marginTop: "16px", alignSelf: "flex-start" }}
              >
                Email creators@yourdomain.com
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
