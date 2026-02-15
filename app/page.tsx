import Link from "next/link";
import type { Metadata } from "next";
import { HomeHero } from "@/components/HomeHero";
import { JsonLd } from "@/components/JsonLd";
import { SeriesCard } from "@/components/SeriesCard";
import { TestimonialGrid } from "@/components/TestimonialGrid";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { getCollectionSeries, getAllSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "EU Webtoon — Read premium European webtoons free-first",
  description:
    "Discover high-quality European webtoons, start free, unlock early episodes with transparent Fast Pass credits, and join the creator pilot.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "EU Webtoon",
    description: "Premium European webtoons with free-first reading and creator-first economics.",
    url: absoluteUrl("/"),
  },
};

const faqItems = [
  ["What is a webtoon?", "A webtoon is a digital-first comic format optimized for vertical scrolling on phones."],
  ["Is EU Webtoon free?", "Yes, every launch series starts with at least one free episode."],
  ["What is Fast Pass?", "Fast Pass lets you unlock selected future episodes early using credits."],
  ["Do I need a subscription?", "No subscription is required. Buy credits only when you want early access."],
  ["How many credits do episodes cost?", "Costs vary by release window and creator settings in the MVP."],
  ["Can I read on mobile?", "Yes, the reading experience is designed mobile-first."],
  ["Can I publish my own webtoon?", "Yes, through our invite-only creator pilot."],
  ["Do creators keep their rights?", "Yes, creators retain ownership of original IP."],
  ["Is exclusivity required?", "No blanket exclusivity is required in current MVP onboarding."],
  ["How often do new episodes drop?", "We prioritize weekly drop cadence for core launches."],
  ["Are episodes SEO-indexable?", "Yes, every series and episode has a clean public URL."],
  ["What is vertical comics format?", "Vertical format uses stacked scene beats for natural thumb-scrolling."],
  ["Can I find European stories specifically?", "Yes, curation focuses on European originals and multilingual creators."],
  ["How do I join the reader waitlist?", "Use the email capture form on the homepage."],
  ["How do creator payouts work?", "Payouts are monthly with transparent unlock reporting."],
  ["How do I apply as creator?", "Visit the creator section and submit your application email."],
  ["Can I use AI Studio without API keys?", "Yes, a deterministic generator works in MVP mode without external APIs."],
  ["What does AI Studio generate?", "Series bible, 10-episode outline, long script beats, and launch copy."],
  ["Can I export AI outputs?", "Yes, copy to clipboard or download markdown."],
  ["What languages are supported?", "Series metadata supports multilingual publishing and discovery."],
  ["Is content moderated?", "Yes, creator onboarding includes content and safety policy review."],
  ["What are staff picks?", "Staff picks are editorially selected titles with strong completion signals."],
  ["What are under-10-minute reads?", "Stories where the opening episode can be read quickly on mobile."],
  ["How can I contact support?", "Use contact@euwebtoon.com for reader and platform support."],
] as const;

export default async function HomePage() {
  const [allSeries, trending, newThisWeek, staffPicks] = await Promise.all([
    getAllSeries(),
    getCollectionSeries("trending", 12),
    getCollectionSeries("newThisWeek", 6),
    getCollectionSeries("staffPicks", 6),
  ]);

  return (
    <div className="space-y-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.shortName,
          url: site.url,
          potentialAction: {
            "@type": "SearchAction",
            target: `${site.url}/series?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Trending series",
          itemListElement: trending.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/series/${item.slug}`),
            name: item.title,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        }}
      />

      <HomeHero />

      <section className="section-shell">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Partners & ecosystem</p>
        <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-700 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Festival selections</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Indie studios</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Creator collectives</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Editorial mentors</div>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Early-access social proof</h2>
        <p className="mt-2 text-sm text-slate-600">Clearly labeled pilot metrics from our MVP cohort and beta creator circle.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-2xl font-bold">{allSeries.length}</p><p className="text-xs text-slate-500">Live pilot series</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-2xl font-bold">{allSeries.reduce((sum, s) => sum + s.episodes.length, 0)}</p><p className="text-xs text-slate-500">Published episodes</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-2xl font-bold">{allSeries.reduce((sum, s) => sum + s.stats.readsBeta, 0).toLocaleString()}</p><p className="text-xs text-slate-500">Cumulative beta reads</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-2xl font-bold">{(allSeries.reduce((sum, s) => sum + s.stats.ratingBeta, 0) / allSeries.length).toFixed(2)}</p><p className="text-xs text-slate-500">Average beta rating</p></div>
        </div>
      </section>

      <section className="space-y-4" id="trending">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Trending now</h2>
          <Link href="/series" className="text-sm font-semibold text-indigo-700">Browse library →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trending.map((item) => <SeriesCard key={item.slug} s={item} />)}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">New this week</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {newThisWeek.map((item) => <SeriesCard key={item.slug} s={item} />)}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Staff picks</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {staffPicks.map((item) => <SeriesCard key={item.slug} s={item} />)}
          </div>
        </div>
      </section>

      <section className="section-shell" id="how-it-works">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-semibold">1) Start free</p><p className="mt-1 text-sm text-slate-600">Open any launch title and read episode one instantly.</p></div>
          <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-semibold">2) Follow your favorites</p><p className="mt-1 text-sm text-slate-600">Build reading streaks and return for weekly drops.</p></div>
          <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-semibold">3) Unlock early when you want</p><p className="mt-1 text-sm text-slate-600">Use Fast Pass credits only when a cliffhanger earns it.</p></div>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Fast Pass credits, explained in 20 seconds</h2>
        <p className="mt-2 text-sm text-slate-600">No subscription required. Buy credits only when you want early access. Transparent and optional.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { name: "Starter", credits: 10, price: "€4.99", note: "Try one or two early unlocks" },
            { name: "Reader", credits: 30, price: "€12.99", note: "Most popular for weekly readers", popular: true },
            { name: "Binge", credits: 80, price: "€29.99", note: "Best value for multi-series binges" },
          ].map((tier) => (
            <div key={tier.name} className={`rounded-xl border p-4 ${tier.popular ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <p className="text-sm font-semibold">{tier.name}{tier.popular ? " · Most popular" : ""}</p>
              <p className="mt-2 text-2xl font-bold">{tier.credits} credits</p>
              <p className="text-sm text-slate-600">{tier.price}</p>
              <p className="mt-2 text-xs text-slate-600">{tier.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Why EU Webtoon</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-semibold">For readers</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Vertical reading optimized for one-hand mobile use.</li>
              <li>Curation-first discovery of European originals.</li>
              <li>Weekly releases with clear free/locked states.</li>
              <li>Fast, indexable URLs that are easy to share.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-semibold">For creators</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Rights clarity and no blanket exclusivity mandate.</li>
              <li>Revenue participation in early-access unlocks.</li>
              <li>Editorial spotlight opportunities in pilot windows.</li>
              <li>AI Studio support for planning and launch copy.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">AI Studio for creator velocity</h2>
        <p className="mt-2 text-sm text-slate-600">Generate a full series bible, episode arcs, vertical script beats, and marketing copy in one flow.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="aspect-video rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-indigo-900 p-5 text-slate-100">
            <p className="text-xs uppercase tracking-[0.15em] text-indigo-200">Product preview</p>
            <p className="mt-3 text-lg font-semibold">Series Bible · Outline · Script · Marketing</p>
            <p className="mt-2 text-sm text-slate-200">Deterministic generation mode included for MVP and offline demos.</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold">Use cases</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Pitch package in under 15 minutes</li>
              <li>Season arc planning for editor reviews</li>
              <li>Trailer text and discovery tag generation</li>
              <li>Panel-beat scaffolding for vertical layouts</li>
            </ul>
            <Link href="/ai-stylist" className="cta-primary mt-4" aria-label="Try AI Studio">Try AI Studio now</Link>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">For creators</h2>
        <p className="mt-2 text-sm text-slate-700">Join an invite-only pilot built around transparent economics, audience growth, and high-signal editorial packaging.</p>
        <Link href="/creators" className="cta-primary mt-4">Apply as creator</Link>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Comparison: creator-first vs generic feed-first platforms</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Capability</th>
                <th className="py-2">EU Webtoon</th>
                <th className="py-2">Generic feed model</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100"><td className="py-2">Free-first onboarding</td><td>Yes, predictable</td><td>Inconsistent</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2">Fast Pass transparency</td><td>Clear credits, no subscription lock</td><td>Often opaque bundles</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2">Creator rights clarity</td><td>Explicit in pilot docs</td><td>Varies by contract</td></tr>
              <tr><td className="py-2">Editorial depth</td><td>Collections + staff picks + launches</td><td>Mostly algorithmic feeds</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <TestimonialGrid />

      <section className="section-shell grid gap-4 md:grid-cols-2">
        <WaitlistCapture type="reader" />
        <WaitlistCapture type="creator" />
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">SEO FAQ: webtoons, Fast Pass, publishing, and vertical format</h2>
        <div className="mt-4 space-y-3">
          {faqItems.map(([question, answer]) => (
            <details key={question} className="rounded-xl border border-slate-200 p-3">
              <summary className="cursor-pointer list-none font-medium text-slate-900">{question}</summary>
              <p className="mt-2 text-sm text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
