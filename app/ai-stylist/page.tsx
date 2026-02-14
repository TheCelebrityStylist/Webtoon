import { AIStudioForm } from "@/components/AIStudioForm";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Studio",
  description: "Generate a new webtoon series and episode draft in seconds.",
  alternates: { canonical: absoluteUrl("/ai-stylist") },
};

export default function AIStudioPage() {
  return (
    <div className="page">
      <section className="hero" style={{ padding: "32px" }}>
        <div className="stack">
          <p className="tagline" style={{ margin: 0 }}>
            AI Studio
          </p>
          <h1 className="heroTitle">Launch a series with AI support</h1>
          <p className="heroSubtitle">
            Craft a new webtoon series with episode-ready pacing, cliffhangers, and a
            creator-forward tone. Generate, preview, and publish directly into the MVP
            library.
          </p>
        </div>
      </section>
      <AIStudioForm />
    </div>
  );
}
