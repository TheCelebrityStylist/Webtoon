import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { WalletDemo } from "@/components/WalletDemo";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing, Credits & Subscription | EU Webtoon",
  description: "Buy credits, start subscription perks, tip creators, unlock bundles, and keep your reading continuity lane active.",
  alternates: { canonical: absoluteUrl("/pricing") },
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "EU Webtoon Credits & Subscription",
          description: "Credits and subscription perks for early unlocks, continuity retention, and bonus scenes.",
          offers: [
            { "@type": "Offer", name: "Starter Credits", priceCurrency: "EUR", price: "4.99", availability: "https://schema.org/InStock" },
            { "@type": "Offer", name: "Reader Credits", priceCurrency: "EUR", price: "12.99", availability: "https://schema.org/InStock" },
            { "@type": "Offer", name: "Monthly Subscription", priceCurrency: "EUR", price: "9.99", availability: "https://schema.org/InStock" },
          ],
        }}
      />

      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Credits + subscription = uninterrupted momentum</h1>
        <p className="mt-2 text-sm text-slate-600">Free episodes start your arc. Credits and subscription perks keep your streak, continuity bonus, and bonus scene access active.</p>

        <h2 className="mt-6 text-xl font-semibold">Credits packs</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            ["Starter", "10 credits", "€4.99", "Unlock key cliffhangers"],
            ["Reader", "30 credits", "€12.99", "Best for weekly progression", true],
            ["Binge", "80 credits", "€29.99", "Best value for multi-series runs"],
          ].map(([name, credits, price, note, popular]) => (
            <div key={String(name)} className={`rounded-xl border p-4 ${popular ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <p className="font-semibold">{name}</p>
              <p className="mt-1 text-xl font-bold">{credits}</p>
              <p className="text-sm text-slate-600">{price}</p>
              <p className="mt-1 text-xs text-slate-500">{note}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-xl font-semibold">Subscription tier (monthly)</h2>
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-lg font-semibold">Continuity Plus · €9.99/month</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Monthly credit drip</li>
            <li>Discounted unlocks</li>
            <li>Early drops on selected arcs</li>
            <li>Bonus chapters and creator commentary</li>
          </ul>
        </div>

        <h2 className="mt-6 text-xl font-semibold">Additional revenue streams</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Tip the creator (micro-support)</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Season bundle unlocks</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Limited drops and premium bonus scenes</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Sponsored placements (clearly labeled)</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Affiliate merch shop (off by default)</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">AI Studio Pro tools plan for creators</div>
        </div>

        <WalletDemo />

        <div className="mt-5 flex gap-3">
          <Link href="/webtoons" className="cta-secondary">Start free</Link>
          <Link href="/ai-studio" className="cta-primary">Try AI Studio Pro</Link>
        </div>
      </section>
    </div>
  );
}
