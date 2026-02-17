import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { WalletDemo } from "@/components/WalletDemo";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing for readers and creators | EU Webtoon",
  description: "Credits, Continuity+ subscription, arc bundles, tips, and Creator Pro plans with AI Studio Pro and cover generation.",
  alternates: { canonical: absoluteUrl("/pricing") },
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "EU Webtoon Reader and Creator Plans",
          description: "Reader credits/subscription and creator plans for publishing and monetization.",
          offers: [
            { "@type": "Offer", name: "Continuity+", priceCurrency: "EUR", price: "9.99" },
            { "@type": "Offer", name: "Credit Pack 30", priceCurrency: "EUR", price: "12.99" },
            { "@type": "Offer", name: "Creator Pro", priceCurrency: "EUR", price: "19.99" },
          ],
        }}
      />

      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Revenue streams for readers and writers</h1>
        <p className="mt-2 text-sm text-slate-600">Use credits to continue instantly, subscribe to protect streaks, and choose creator plans to scale publishing output.</p>

        <h2 className="mt-5 text-xl font-semibold">Reader plans</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">Free</p>
            <p className="mt-1 text-sm text-slate-600">Start episodes, community access, standard release timing.</p>
          </div>
          <div className="rounded-xl border border-indigo-500 bg-indigo-50 p-4">
            <p className="font-semibold">Continuity+ · €9.99/mo</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
              <li>Monthly credit drip</li>
              <li>Streak protection</li>
              <li>Discounted unlocks</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">Credit Packs</p>
            <p className="mt-1 text-sm text-slate-600">10 credits (€4.99), 30 credits (€12.99), 80 credits (€29.99).</p>
          </div>
        </div>

        <h2 className="mt-6 text-xl font-semibold">Creator plans</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Creator Basic</p><p className="mt-1 text-sm text-slate-600">Publishing dashboard, unlock analytics, tip jar.</p></div>
          <div className="rounded-xl border border-indigo-500 bg-indigo-50 p-4"><p className="font-semibold">Creator Pro · €19.99/mo</p><p className="mt-1 text-sm text-slate-700">AI Studio Pro, cover generator, pacing assistant, marketing kit, localization drafts.</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Creator Studio+ · €49/mo</p><p className="mt-1 text-sm text-slate-600">Team seats, paid season launches, premium POV add-ons, subscriber-only episodes.</p></div>
        </div>

        <h2 className="mt-6 text-xl font-semibold">Additional streams</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Arc bundles / season unlocks</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Creator tipping and bonus scene unlocks</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Premium POV add-ons</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Sponsored placements (labeled) and optional affiliate shop</div>
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
