import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SeriesCard } from "@/components/SeriesCard";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { getAllSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "EU Webtoon — Read European webtoons and serial fiction",
  description: "Start reading free episodes, unlock early access with Fast Pass credits, and discover Europe’s next breakout creators.",
  alternates: { canonical: absoluteUrl("/") },
};

export default async function HomePage() {
  const topSeries = (await getAllSeries()).slice(0, 6);

  return (
    <div className="space-y-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.shortName,
          url: site.url,
        }}
      />

      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">European stories, mobile-first</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Read breakthrough webtoons. Build your next favorite obsession.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-700">
          Start reading free today. Unlock early episodes only when you want more. No subscription lock-in.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/series" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Start reading free</Link>
          <Link href="/ai-stylist" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:border-slate-900">Explore AI Studio</Link>
        </div>
        <ul className="mt-6 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <li>✔ Free first episodes on every launch title</li>
          <li>✔ Vertical reading tuned for phones</li>
          <li>✔ Invite-only creator program with transparent split</li>
        </ul>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-bold">MVP</p><p className="text-sm text-slate-600">Early access platform stage</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-bold">8+ series</p><p className="text-sm text-slate-600">Seeded editorial library live</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-bold">24 episodes</p><p className="text-sm text-slate-600">Indexable, shareable reading URLs</p></div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Trending now</h2>
            <p className="text-sm text-slate-600">Fresh picks from European creators and studio partners.</p>
          </div>
          <Link href="/series" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">View all series →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topSeries.map((s) => (
            <SeriesCard key={s.slug} s={s} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-xl font-semibold">Why EU Webtoon</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li><strong>Mobile-first vertical reading:</strong> tuned for thumb-paced storytelling.</li>
            <li><strong>Weekly drops:</strong> predictable release cadence and clear episode states.</li>
            <li><strong>Discover European voices:</strong> multilingual creators and city-specific worlds.</li>
            <li><strong>Fast, indexable pages:</strong> each series and episode has its own SEO URL.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-xl font-semibold">How Fast Pass works</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>Start free with Episode 1 on every series.</li>
            <li>Use credits to unlock selected upcoming episodes early.</li>
            <li>No subscription required. Buy credits only when you want early access.</li>
          </ol>
        </div>
      </section>

      <section id="creators" className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-2xl font-semibold tracking-tight">For creators</h2>
        <p className="mt-2 text-sm text-slate-700">Publish episodic stories, grow a loyal audience, and monetize early access without giving up your IP.</p>
        <p className="mt-2 text-sm text-slate-700"><strong>Revenue model (MVP):</strong> Fast Pass credit unlocks are split with creators; onboarding is invite-only while tooling stabilizes.</p>
        <Link href="mailto:creators@euwebtoon.com" className="mt-4 inline-flex rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Apply for creator access</Link>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>FAQ — Payout timing</strong><br />Monthly payouts with transparent unlock reporting.</div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>FAQ — Rights ownership</strong><br />Creators retain IP ownership of original works.</div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>FAQ — Exclusivity</strong><br />No blanket exclusivity in MVP agreements.</div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><strong>FAQ — Formats</strong><br />Vertical episodes, story arcs, and bonus posts supported.</div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <WaitlistCapture type="reader" />
        <WaitlistCapture type="creator" />
      </section>
    </div>
  );
}
