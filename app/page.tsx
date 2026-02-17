import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

const metrics = [
  { label: "Reader arc completions / month", value: "94k" },
  { label: "Active creators", value: "1,240" },
  { label: "Avg creator unlock conversion", value: "18.4%" },
  { label: "Average rating", value: "4.8/5" },
];

export const metadata: Metadata = {
  title: "EU Webtoon | Community discovery + arc completion economics",
  description: "A premium webtoon platform: readers finish arcs without losing momentum, creators ship faster with Foretelling-like monetization and analytics.",
  alternates: { canonical: absoluteUrl("/") },
};

export default function HomePage() {
  return (
    <div className="space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "EU Webtoon", url: absoluteUrl("/") }} />

      <section className="section-shell premium-hero overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Reader + Creator Platform</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Finish arcs without losing momentum. Ship series with predictable earnings.</h1>
            <p className="mt-4 max-w-2xl text-slate-600">EU Webtoon combines Wattpad-style discovery and community with Foretelling-style arc completion economics and creator growth tooling.</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/readers" className="cta-primary">I’m here to read</Link>
              <Link href="/creators" className="cta-secondary">I’m here to publish</Link>
              <Link href="/pricing" className="cta-secondary">Unlock your first Arc Pass</Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <article className="rounded-xl border border-indigo-200 bg-white/90 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">Reader path</p>
                <p className="mt-1 text-sm text-slate-700">Pick a genre → read episode 1 free → enter Arc Lane → unlock when tension spikes.</p>
                <Link href="/readers" className="mt-2 inline-flex text-sm font-semibold text-indigo-700">Open Reader track →</Link>
              </article>
              <article className="rounded-xl border border-fuchsia-200 bg-white/90 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fuchsia-700">Creator path</p>
                <p className="mt-1 text-sm text-slate-700">Preview dashboard → set monetization model → launch cadence → scale conversion.</p>
                <Link href="/creators" className="mt-2 inline-flex text-sm font-semibold text-fuchsia-700">Open Creator track →</Link>
              </article>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["paper-crown", "midnight-canal", "afterlight", "quiet-fire"].map((cover) => (
              <div key={cover} className="card-hover relative aspect-[3/4] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                <Image src={`/covers/${cover}.svg`} alt={`${cover} cover`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="mt-1 text-sm text-slate-600">{metric.label}</p>
          </article>
        ))}
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Why we’re different</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><strong>Wattpad:</strong> community discovery first.</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><strong>Foretelling:</strong> premium progression and arc economics.</div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm"><strong>EU Webtoon:</strong> community discovery + arc completion economics + creator growth tooling.</div>
        </div>
        <Link href="/compare" className="cta-secondary mt-4">See full comparison</Link>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Pricing preview</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">For Readers</p>
            <p className="mt-1 text-sm text-slate-600">Free · Continuity+ · Superfan with arc bundles, credits, and streak protection.</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">For Creators</p>
            <p className="mt-1 text-sm text-slate-600">Starter · Creator Pro · Studio+ with analytics, monetization controls, and promotion tools.</p>
          </article>
        </div>
        <Link href="/pricing" className="cta-primary mt-4">View full pricing</Link>
      </section>
    </div>
  );
}
