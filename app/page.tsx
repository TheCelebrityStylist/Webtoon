import Link from "next/link";
import type { Metadata } from "next";
import { HomeHero } from "@/components/HomeHero";
import { JsonLd } from "@/components/JsonLd";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { getCollectionSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Finish arcs without waiting | EU Webtoon",
  description:
    "Finish arcs without waiting. Start free with European originals, then spoiler-proof your binge with Arc Pass credits and Continuity+.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "Finish arcs. Don’t wait.",
    description: "European originals built for vertical binge reading. Start free, stay ahead with Continuity+ and Arc Pass credits.",
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Finish arcs. Don’t wait.",
    description: "Start free, then spoiler-proof your binge with Arc Pass credits and Continuity+.",
  },
};

const faqItems = [
  {
    q: "What is a webtoon?",
    a: "A webtoon is a vertical, mobile-first comic format designed for thumb scrolling. It favors readable pacing, clean dialogue beats, and scene transitions that feel natural on phones. EU Webtoon focuses on European originals with strong continuity loops so readers can start free and keep momentum through premium arcs.",
  },
  {
    q: "Why do readers pay for credits?",
    a: "Readers pay to finish arcs without waiting. Credits unlock cliffhangers up to five days early, preserve streak rhythm, and open bonus POV scenes tied to arc completion. The value is continuity: less interruption, fewer spoilers, and a stronger narrative flow across multiple active series.",
  },
  {
    q: "How do creators get paid?",
    a: "Every unlock supports the creator directly through transparent revenue share logic. Readers can also tip creators and buy season bundles. This gives artists and writers multiple income streams beyond ad-based models and helps maintain a healthier release cadence.",
  },
  {
    q: "What is Continuity+ subscription?",
    a: "Continuity+ is a monthly tier with credit drip, discounted unlocks, streak protection, and selected early drops. It is built for consistent readers who follow several arcs each week and want to remove friction from cliffhanger waits.",
  },
] as const;

const seoLongform = `
What is a webtoon? At its core, a webtoon is a digital-first storytelling format optimized for vertical reading on mobile devices. Unlike print comics designed for page turns, webtoons are constructed as scroll narratives: each beat appears in sequence, allowing creators to shape pace through spacing, rhythm, and reveal timing. This format is ideal for modern reading behavior where sessions happen in short bursts during commutes, evenings, and in-between moments. The strongest webtoon products treat this not as a design trend, but as a narrative system.

In Europe, the webtoon market is still open enough for quality-focused platforms to define reader expectations. Many readers have tried global apps, but they still struggle with a recurring problem: they can start plenty of stories, yet they do not finish enough of them. The issue is rarely content availability alone. The issue is continuity. When people wait too long between important episodes, they forget emotional context, lose momentum, and drop off before arcs pay off. EU Webtoon is built around solving that exact retention gap with clear progression mechanics.

The central proposition is simple and repeated across the product: finish arcs without waiting. Free episodes are used for onboarding, but the paid layer exists to protect continuity. Arc Pass credits unlock episodes early at cliffhanger boundaries so readers can keep momentum. Continuity+ subscription adds monthly credit drip and streak protection so regular readers can move through multiple titles without friction. This is not about pushing payments for cosmetic perks. It is about preserving narrative flow, avoiding spoiler fatigue, and rewarding committed reading behavior.

Best webtoon alternatives in Europe should do four things well: curation, continuity, creator economics, and technical SEO. Curation matters because readers do not want infinite noise; they want clear pathways to high-signal series. Continuity matters because serialized storytelling succeeds only when readers can keep pace with meaningful updates. Creator economics matter because premium stories require sustainable production. Technical SEO matters because discoverability must work beyond social feeds and paid ads.

EU Webtoon’s library strategy focuses on editorially guided continuity lanes rather than random browsing loops. Each series has a clear hook, arc structure, free-versus-locked states, and explicit progression cues. Reader psychology is not treated as manipulation; it is treated as product clarity. If waiting introduces friction, the interface should explain what changes: spoiler risk increases, streak rhythm weakens, and bonus extras may expire. If unlocking improves outcomes, that should be visible too: continue now, keep your streak, finish the current arc, support the creator.

How Fast Pass or credits work in this model is straightforward. Credits are a pacing tool. You spend them when the next episode is locked but your current emotional context is still hot. In practical terms, that means you can read through pivotal turns while motivation is high. For some readers this happens occasionally at major reveals; for others it is a weekly habit across several series. The product supports both by offering packs, bundles, and subscription options with clearly explained benefits.

Vertical reading is better for retention when done correctly because it reduces cognitive switching. The reader does not need to parse page grids or jump between panel clusters. The narrative can present one beat at a time with controlled spacing, which is especially effective for suspense, humor timing, and emotional reveals. In a premium implementation, typography, contrast, and rhythm are tuned so long sessions remain comfortable. This is where product and storytelling intersect: design choices directly influence completion rate.

For creators, the value proposition has to be equally concrete. A creator-first platform should combine transparent unlock revenue, optional tipping, bundle mechanics, and practical tooling that shortens repetitive production tasks. EU Webtoon positions AI Studio as one of those tools. The goal is not to replace creative voice. The goal is to accelerate packaging: series bible drafts, episode blueprints, character voice sheets, pacing notes, and marketing kits. With stronger tooling, creators can ship better episodes faster and keep release cadence predictable.

SEO excellence for webtoons is often overlooked, yet it is a major moat. Every important page needs complete metadata, canonical URLs, and valid structured data. Series pages should publish CreativeWorkSeries data. Pricing should use Product and Offer entities. FAQs should expose structured Q&A. Sitemaps should include accurate last-modified dates. Robots rules should stay clean. Internal linking should connect the homepage, library hubs, genre paths, and episode routes in a way that helps both users and crawlers understand topical relationships.

A robust webtoon platform should also publish substantial educational content. Readers search for terms like webtoon alternatives in Europe, best webtoon app Europe, vertical comics, and how creators get paid in webcomics. Thin landing pages do not win those queries. Depth wins: clear definitions, practical comparison points, transparent monetization explanation, and examples of how reading continuity improves satisfaction. This long-form block exists to do that work while staying connected to live product actions.

There is also a trust dimension. Readers are increasingly skeptical of opaque urgency patterns and unclear pricing. The right approach is explicit value exchange. If an arc lock appears, explain what unlocking changes and what waiting costs in terms of continuity. If subscription perks exist, list them in plain language. If sponsored placements appear, label them clearly. Trust and conversion are not opposites. In subscription and credit products, trust is a conversion multiplier over time.

Why does completion matter so much? Completion is the bridge between first-session curiosity and durable habit. A reader who completes one arc is far more likely to start another and more likely to invest in creator support. Completion also improves recommendation quality because progression data becomes meaningful. Rather than guessing from one click, the product can understand genres, pacing preferences, and update cadence fit based on what readers actually finish.

European storytelling texture is a differentiator when it is treated with specificity. Settings, institutions, dialect traces, civic context, and social stakes should feel local, not generic. Premium webtoon readers notice this quickly. They can tell when a story is built from interchangeable templates versus grounded detail. EU Webtoon’s flagship strategy emphasizes that distinction through curated series with strong hooks, clearer genre promises, and designed cliffhangers that reward continuation.

From a product perspective, the best path is consistent: start free, show momentum, resolve objections early, and make paid progression the lowest-friction route when tension peaks. The homepage should communicate why people pay within the first viewport. Library pages should reduce decision fatigue. Series pages should foreground stakes and progression status. Reader pages should deliver clean reading mode, teaser depth, and respectful paywalls with obvious next steps.

Finally, creator economics should remain visible to readers. Unlocking should feel like participation in the next episode, not just a transaction. Tips should be lightweight and optional. Bundles should make sense for binge readers. Subscription should reward consistency. AI Studio Pro should save real time for creators shipping regularly. This ecosystem approach is how a webtoon platform moves from content catalog to durable product.

EU Webtoon exists for one reason: help readers finish great arcs and help creators get paid to keep making them. Everything in the UX, pricing, and content model points to that shared outcome.
`;

export default async function HomePage() {
  const [trending] = await Promise.all([getCollectionSeries("trending", 6)]);

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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.shortName,
          url: site.url,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <HomeHero />

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold">1) Start free</p><p className="mt-1 text-sm text-slate-600">Open free episodes and choose your continuity lane.</p></article>
          <article className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold">2) Hit cliffhanger</p><p className="mt-1 text-sm text-slate-600">When tension peaks, unlock instantly with credits.</p></article>
          <article className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold">3) Keep momentum</p><p className="mt-1 text-sm text-slate-600">Use Continuity+ to protect streak and stay spoiler-safe.</p></article>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Continuity Lane picks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {trending.slice(0, 3).map((s) => (
            <article key={s.slug} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">Unlock 5 days early · Keep streak · Bonus POV scenes</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/series/${s.slug}`} className="cta-secondary px-3 py-2 text-xs">Continue</Link>
                <Link href="/pricing" className="cta-primary px-3 py-2 text-xs">Get credits</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Objections, answered</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><strong>“Is this expensive?”</strong><br />Start free, then pay only when cliffhangers matter. Subscription is optional.</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><strong>“Do creators benefit?”</strong><br />Yes. Unlocking supports the creator directly and funds future episodes.</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><strong>“Can I cancel monthly?”</strong><br />Yes. Continuity+ is monthly and cancel-anytime.</div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><strong>“Why pay at all?”</strong><br />Because waiting breaks momentum, increases spoiler risk, and delays payoff.</div>
        </div>
      </section>

      <section className="section-shell prose prose-slate max-w-none whitespace-pre-line text-sm text-slate-700">
        <h2>European webtoons guide</h2>
        {seoLongform}
      </section>

      <section className="section-shell grid gap-4 md:grid-cols-2">
        <WaitlistCapture type="reader" />
        <WaitlistCapture type="creator" />
      </section>

      <section className="section-shell text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Finish arcs. Don’t wait.</h2>
        <p className="mt-2 text-lg text-slate-700">Start free, then spoiler-proof your binge.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/webtoons" className="cta-primary">Start reading free</Link>
          <Link href="/pricing" className="cta-secondary">Get credits</Link>
        </div>
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
      </section>
    </div>
  );
}
