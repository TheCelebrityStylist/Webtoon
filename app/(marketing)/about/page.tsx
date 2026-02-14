// app/(marketing)/about/page.tsx
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description:
    "How this platform works: free episodes, Fast Pass early access via credits, and revenue sharing for creators.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="page">
      <section className="hero" style={{ padding: "32px" }}>
        <div className="stack">
          <p className="tagline" style={{ margin: 0 }}>
            About the platform
          </p>
          <h1 className="heroTitle" style={{ fontSize: "2.4rem" }}>
            Built for European creators and mobile readers
          </h1>
          <p className="heroSubtitle">
            This is a vertical webtoon + serialized fiction platform optimized for mobile
            reading. Most episodes are free. Some episodes can be unlocked early using
            credits (Fast Pass).
          </p>
        </div>
      </section>

      <section className="surface">
        <div className="grid gridCards">
          {[
            {
              title: "Readers",
              copy: "Start free, build a library, and unlock early access when you're ready.",
            },
            {
              title: "Creators",
              copy: "Publish episodic stories, build superfans, and share in Fast Pass revenue.",
            },
            {
              title: "SEO-first",
              copy: "Every series and episode has indexable URLs, optimized metadata, and sharing cards.",
            },
          ].map((item) => (
            <div key={item.title} className="card">
              <h3 style={{ marginTop: 0 }}>{item.title}</h3>
              <p style={{ margin: 0, color: "var(--muted)" }}>{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gridCards">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Why now?</h3>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            European creators are producing world-class webtoons, but discovery and
            monetization remain fragmented. We provide a homebase with a professional
            reading experience and creator tools.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>What’s next?</h3>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            We’re expanding the creator roster, improving reader personalization, and
            rolling out analytics dashboards for episode performance.
          </p>
        </div>
      </section>
    </div>
  );
}
