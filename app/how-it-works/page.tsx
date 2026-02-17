import type { Metadata } from "next";
import Link from "next/link";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

const faqs = [
  { q: "Do readers need to pay to start?", a: "No. Reader onboarding starts with free episodes so users can evaluate the story before deciding to unlock." },
  { q: "How do creators earn?", a: "Creators earn through unlock revenue share, tips, bundles, and creator subscription plans with tooling upsells." },
  { q: "Who owns IP?", a: "Creator agreements are designed around rights clarity and transparent monetization terms." },
];

export const metadata: Metadata = {
  title: "How it works | Readers and creators",
  description: "Two-track explainer for reader and creator flows with timeline steps, visual cards, and practical FAQs.",
  alternates: { canonical: absoluteUrl("/how-it-works") },
};

export default function HowItWorksPage() {
  return (
    <div className="space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <section className="section-shell">
        <h1 className="text-4xl font-bold tracking-tight">How it works: two-track platform</h1>
        <p className="mt-2 text-slate-600">Reader flow and creator flow are both first-class: one for discovery + completion, one for publishing + monetization + analytics.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="#reader-flow" className="pill">#reader-flow</Link>
          <Link href="#creator-flow" className="pill">#creator-flow</Link>
          <Link href="#pricing" className="pill">#pricing</Link>
          <Link href="#faq" className="pill">#faq</Link>
        </div>
      </section>

      <section id="reader-flow"><HowItWorksSection defaultTrack="reader" large /></section>
      <section id="creator-flow"><HowItWorksSection defaultTrack="creator" large /></section>

      <section id="pricing" className="section-shell rounded-2xl border border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-semibold tracking-tight">Pricing path</h2>
        <p className="mt-2 text-sm text-slate-700">Readers can use free, credits, or Continuity+. Creators can use Basic, Pro, or Studio+.</p>
        <Link href="/pricing" className="cta-primary mt-4">Open pricing</Link>
      </section>

      <section id="faq" className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
        <div className="mt-3 space-y-2">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl border border-slate-200 p-3">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
