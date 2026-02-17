import Link from "next/link";
import type { Metadata } from "next";
import { HomeHero } from "@/components/HomeHero";
import { JsonLd } from "@/components/JsonLd";
import { SeoInsights } from "@/components/SeoInsights";
import { SeriesCard } from "@/components/SeriesCard";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { getCollectionSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Finish arcs without waiting | EU Webtoon",
  description: "Wattpad × Foretelling on steroids: start free, then spoiler-proof your binge with Arc Pass credits and Continuity+.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "Finish arcs. Don’t wait.",
    description: "European originals built for vertical binge reading. Start free, then stay ahead with Continuity+ and Arc Pass credits.",
    url: absoluteUrl("/"),
  },
};

const faqItems = [
  {
    q: "What is a webtoon?",
    a: "A webtoon is a vertical, mobile-first comic optimized for scroll reading. EU Webtoon focuses on European originals and continuity-driven progression so readers can start free and still finish arcs without losing momentum.",
  },
  {
    q: "Why pay for Arc Pass credits?",
    a: "Credits unlock episodes early at cliffhanger moments, preserve continuity lane momentum, and open bonus POV scenes. The goal is story completion without waiting gaps or spoiler fatigue.",
  },
  {
    q: "How do creators get paid?",
    a: "Unlocks, tips, bundles, and subscription engagement directly support creators. This gives writers and artists more sustainable recurring revenue than a pure wait-and-ad model.",
  },
  {
    q: "What is Continuity+?",
    a: "Continuity+ is a monthly plan with credit drip, discounted unlocks, and streak protection for active readers who follow multiple series each week.",
  },
] as const;

const seoLongform = `
EU Webtoon is designed as a European-native answer to the biggest problem in serial reading: people start stories but do not finish enough of them. A webtoon is a vertical comic format made for phones, and the strongest products in this space win by reducing continuity friction. That means clear hooks, consistent pacing, smart cliffhanger handling, and product mechanics that help readers continue when tension peaks.

Wattpad made online story communities mainstream. Foretelling-style progression systems proved that structured momentum can improve completion. EU Webtoon combines both principles and pushes them harder for visual serial fiction. Readers get free entry points, but they also get continuity mechanics that explain why paying can be useful at the right moment: unlock early, avoid spoilers, protect streak rhythm, and complete arcs while emotional context is still fresh.

For discovery, the platform prioritizes curated continuity lanes over random feed loops. Every series includes arc-level progression cues and clear free-versus-locked states. For monetization, readers can choose credits, monthly subscription, bundles, and tips. For creators, the model includes unlock revenue, optional premium add-ons, and creator tooling such as AI Studio Pro. This is not a cosmetic layer; it is a retention and sustainability layer.

Vertical reading itself has practical advantages. It reduces panel-scanning overhead and enables controlled reveal timing. Good vertical episodes use spacing and rhythm to guide attention, making suspense and emotional beats land more reliably on mobile screens. When UX and storytelling align, completion rises. Completion is the key metric because it predicts return behavior, conversion propensity, and downstream creator support.

From an SEO standpoint, a strong webtoon platform requires technical quality and content depth. Canonicals, metadata, JSON-LD, crawlable routes, and accurate sitemaps are the baseline. Topical authority then comes from real explanatory content: what webtoons are, why continuity matters, how credits/subscriptions work, and how creators get paid. Readers and creators alike search for these questions before committing to a platform.

European specificity matters too. The region is multilingual, culturally diverse, and often under-served by generic global feed products. EU Webtoon positions itself around this gap with editorial curation and productized progression. The result is a reading experience that feels less like endless browsing and more like guided completion.

In short, EU Webtoon exists to help readers finish stories and help creators fund the next chapter. Start free, keep momentum, unlock where it matters, and build a healthier ecosystem for premium vertical storytelling in Europe.
`;

export default async function HomePage() {
  const featured = await getCollectionSeries("trending", 6);

  return (
    <div className="space-y-12">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: site.shortName, url: site.url }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: site.shortName, url: site.url }} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
        }}
      />

      <HomeHero />

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Episodes released</p><p className="mt-1 text-2xl font-bold">2,400+</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Arcs completed</p><p className="mt-1 text-2xl font-bold">18,000+</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Bonus scenes unlocked</p><p className="mt-1 text-2xl font-bold">42,000+</p></div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Featured series</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => <SeriesCard key={s.slug} s={s} />)}
        </div>
      </section>

      <section className="section-shell rounded-2xl border border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-semibold tracking-tight">Arc Momentum Meter</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Arc Progress</p><p className="text-lg font-semibold">72%</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Spoiler Risk</p><p className="text-lg font-semibold text-rose-600">High (68/100)</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-500">Bonus Unlock Tier</p><p className="text-lg font-semibold text-indigo-700">Tier 2 · POV scene</p></div>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Wattpad lets you read stories. EU Webtoon lets you finish them.</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">Wattpad</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
              <li>Community-first</li>
              <li>Release-based reading</li>
              <li>Free waiting model</li>
            </ul>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <h3 className="font-semibold">EU Webtoon</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              <li>Arc-first storytelling</li>
              <li>Continuity mechanics</li>
              <li>Momentum reading</li>
              <li>Bonus POV unlocks</li>
              <li>Creator-backed premium drops</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">How creators earn</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Reader credits, Continuity+ subscriptions, arc bundles, and tips.</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Creator plans: Basic, Pro, Studio+ with AI Studio Pro and cover generation.</div>
        </div>
      </section>

      <SeoInsights article={seoLongform} />

      <section className="section-shell grid gap-4 md:grid-cols-2">
        <WaitlistCapture type="reader" />
        <WaitlistCapture type="creator" />
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
        <div className="mt-4 space-y-3">
          {faqItems.map((item) => (
            <details key={item.q} className="rounded-xl border border-slate-200 p-3">
              <summary className="cursor-pointer list-none font-medium text-slate-900">{item.q}</summary>
              <p className="mt-2 text-sm text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-5 flex gap-3">
          <Link href="/webtoons" className="cta-primary">Start reading free</Link>
          <Link href="/pricing" className="cta-secondary">Get credits</Link>
        </div>
      </section>
    </div>
  );
}
