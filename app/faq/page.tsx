import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

const faqs = [
  ["What is EU Webtoon?", "EU Webtoon is a mobile-first platform for European vertical stories and webtoons."],
  ["How does Fast Pass work?", "Use credits to unlock upcoming episodes early. It is optional and subscription-free."],
  ["Can creators keep rights?", "Yes. MVP creator agreements preserve rights ownership for original works."],
  ["Do you support AI writing workflows?", "Yes. AI Studio generates bibles, outlines, scripts, and marketing copy."],
  ["How do I start reading?", "Browse series, open a free first episode, and continue at your own pace."],
] as const;

export const metadata: Metadata = {
  title: "FAQ | EU Webtoon",
  description: "Frequently asked questions about webtoons, Fast Pass credits, publishing, and AI Studio.",
  alternates: { canonical: absoluteUrl("/faq") },
};

export default function FaqPage() {
  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
        <div className="mt-4 space-y-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="rounded-xl border border-slate-200 p-3">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
