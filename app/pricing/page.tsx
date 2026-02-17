import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PricingToggle } from "@/components/PricingToggle";
import { absoluteUrl } from "@/lib/seo";

const faqs = [
  {
    q: "Can readers finish arcs without subscribing?",
    a: "Yes. You can use one-off credit packs and arc bundles. Continuity+ simply lowers the cost and protects streak momentum.",
  },
  {
    q: "How do creators make money on EU Webtoon?",
    a: "Creators monetize through early unlock credits, arc bundles, direct tips, optional creator subscriptions, and featured promo placements.",
  },
  {
    q: "Do creators keep rights to their IP?",
    a: "Yes. Contracts are creator-first with explicit rights and transparent payout reporting.",
  },
];

export const metadata: Metadata = {
  title: "Pricing | Readers + Creators | EU Webtoon",
  description: "Compare reader and creator plans: credits, Continuity+, arc bundles, tips, creator subscriptions, Creator Pro, and Studio+.",
  alternates: { canonical: absoluteUrl("/pricing") },
};

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }} />

      <section className="section-shell">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Pricing</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Choose your track, then scale your outcome</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Readers pay for momentum and payoff. Creators pay for tooling and predictable growth. Both tracks can start free and convert as value appears.</p>
      </section>

      <section className="section-shell">
        <PricingToggle />
      </section>

      <section id="reader-faq" className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Pricing FAQ</h2>
        <div className="mt-4 space-y-2">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/readers" className="cta-secondary">Explore reader flow</Link>
          <Link href="/creators" className="cta-primary">Explore creator flow</Link>
        </div>
      </section>
    </div>
  );
}
