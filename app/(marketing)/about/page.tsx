import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About EU Webtoon",
  description: "Our editorial mission, quality standards, and creator-first publishing policy for vertical storytelling.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About EU Webtoon",
          url: absoluteUrl("/about"),
        }}
      />
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Editorial mission</h1>
        <p className="mt-3 text-sm text-slate-700">
          EU Webtoon exists to publish European originals with premium reading UX, clear monetization rules, and conversion-aware product design that helps great stories earn attention.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="section-shell">
          <h2 className="text-xl font-semibold">Quality standards</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Vertical-first scene pacing and readable typography.</li>
            <li>Clear free vs Fast Pass signaling on every episode.</li>
            <li>Weekly release reliability and transparent scheduling.</li>
            <li>Metadata, schema, and crawlable routes for discoverability.</li>
          </ul>
        </article>
        <article className="section-shell">
          <h2 className="text-xl font-semibold">Content policy summary</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>No hate content, exploitation, or unsafe creator conduct.</li>
            <li>Contextual content warnings encouraged and displayed.</li>
            <li>Original rights remain with creators unless explicitly licensed.</li>
            <li>Moderation decisions prioritize reader safety and legal compliance.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
