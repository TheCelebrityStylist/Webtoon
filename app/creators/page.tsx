import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "For creators | EU Webtoon",
  description: "Foretelling-like creator growth stack: publish faster, monetize earlier, and optimize retention with real dashboards.",
  alternates: { canonical: absoluteUrl("/creators") },
};

const monetization = [
  "Early unlock credits",
  "Arc bundles",
  "Direct tips",
  "Creator subscriptions",
  "Featured placement boosts",
  "Creator Pro tooling plans",
];

export default function CreatorsPage() {
  return (
    <div className="space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "EU Webtoon Creator Program", url: absoluteUrl("/creators") }} />

      <section className="section-shell premium-hero">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">Creator growth stack</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Ship faster, earn earlier, grow reliably.</h1>
        <p className="mt-3 max-w-3xl text-slate-600">EU Webtoon gives you Foretelling-like control: arc engineering, conversion analytics, promo surfaces, and clear payout reporting from day one.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/creator-portal" className="cta-primary">Open creator portal</Link>
          <Link href="#apply" className="cta-secondary">Apply to Creator Program</Link>
          <Link href="/pricing" className="cta-secondary">See creator pricing</Link>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">How creators make money</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {monetization.map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">{item}</div>)}
        </div>
      </section>

      <section className="section-shell grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-xl font-semibold">Publishing workflow</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>• Upload vertical episodes and covers</li>
            <li>• Set cadence and paywall placement per arc</li>
            <li>• Run launch checklist before go-live</li>
            <li>• Auto-publish in selected language lanes</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-xl font-semibold">Analytics that change behavior</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>• Retention curve by episode and arc</li>
            <li>• Drop-off heatmap at panel transitions</li>
            <li>• Cliffhanger score and rewrite prompts</li>
            <li>• Unlock conversion funnel + A/B pricing tests</li>
          </ul>
        </article>
      </section>

      <section className="section-shell rounded-2xl border border-emerald-200 bg-emerald-50">
        <h2 className="text-2xl font-semibold tracking-tight">Rights & IP clarity</h2>
        <p className="mt-2 text-sm text-emerald-900">You keep IP ownership. Revenue terms are explicit. Payout statements are transparent and exportable.</p>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Pricing preview</h2>
        <p className="mt-2 text-sm text-slate-600">Starter (free), Creator Pro (€29), Studio+ (€79) with escalating growth tooling and launch support.</p>
        <Link href="/pricing" className="cta-primary mt-4">View full pricing</Link>
      </section>

      <section id="apply" className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Apply to Creator Program</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border border-slate-300 bg-white px-3 py-2" placeholder="Creator name" />
          <input className="rounded-xl border border-slate-300 bg-white px-3 py-2" placeholder="Email" type="email" />
          <input className="rounded-xl border border-slate-300 bg-white px-3 py-2" placeholder="Series concept" />
          <input className="rounded-xl border border-slate-300 bg-white px-3 py-2" placeholder="Primary language" />
          <textarea className="md:col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2" rows={4} placeholder="Why this series will retain readers" />
          <button type="submit" className="cta-primary md:col-span-2">Submit application</button>
        </form>
      </section>
    </div>
  );
}
