import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { StylistClient } from "@/components/StylistClient";

export const metadata: Metadata = {
  title: "AI Stylist",
  description:
    "Premium AI stylist curated from real EU retailers. Get a complete look with live products.",
  alternates: { canonical: absoluteUrl("/look") },
};

export default function LookPage() {
  return (
    <div className="page">
      <section className="hero" style={{ padding: "32px" }}>
        <div className="stack">
          <p className="tagline" style={{ margin: 0 }}>
            AI Stylist
          </p>
          <h1 className="heroTitle" style={{ fontSize: "2.4rem" }}>
            Premium EU styling, instantly curated
          </h1>
          <p className="heroSubtitle">
            Describe your vibe, budget, and occasion. We’ll curate real, shoppable pieces
            across premium EU retailers.
          </p>
        </div>
      </section>
      <StylistClient />
    </div>
  );
}
