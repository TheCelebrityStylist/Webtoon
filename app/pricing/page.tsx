import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PricingToggle } from "@/components/PricingToggle";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing | Readers + Creators",
  description: "Reader and creator pricing in one place: credits, Continuity+, bundles, tips, Creator Pro, and Studio+ plans.",
  alternates: { canonical: absoluteUrl("/pricing") },
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "EU Webtoon plans",
          description: "Reader and creator plans for discovery, completion, publishing, and monetization.",
          offers: [
            { "@type": "Offer", name: "Continuity+", priceCurrency: "EUR", price: "9.99" },
            { "@type": "Offer", name: "Creator Pro", priceCurrency: "EUR", price: "19.99" },
            { "@type": "Offer", name: "Creator Studio+", priceCurrency: "EUR", price: "49.00" },
          ],
        }}
      />
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing for both products</h1>
        <p className="mt-2 text-sm text-slate-600">Reader monetization and creator monetization are explicit and separated. Pick your track below.</p>
        <PricingToggle />
      </section>
    </div>
  );
}
