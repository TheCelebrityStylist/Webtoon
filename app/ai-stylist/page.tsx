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
    <div className="stack" style={{ gap: "32px" }}>
      <section className="hero" style={{ padding: "32px" }}>
        <h1 className="heroTitle">AI Studio</h1>
        <p className="heroSubtitle">
          Craft a new webtoon series with episode-ready pacing, cliffhangers, and a
          creator-forward tone. Generate, preview, and publish directly into the MVP
          library.
        </p>
      </section>
      <AIStudioForm />
    </div>
  );
}
