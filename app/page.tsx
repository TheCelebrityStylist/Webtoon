import Link from "next/link";
import type { Metadata } from "next";
import { HomeHero } from "@/components/HomeHero";
import { JsonLd } from "@/components/JsonLd";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { getCollectionSeries } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "EU Webtoon — Start free, stay ahead, finish arcs",
  description:
    "Start reading free episodes now, continue your progression, and unlock early drops with Arc Pass before public release.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "EU Webtoon",
    description: "Start free, continue your arc, and stay ahead of weekly drops with Arc Pass.",
    url: absoluteUrl("/"),
  },
};


const seoEssay = `European webtoons are entering a decisive phase where reader experience, creator economics, and product design must work together. EU Webtoon focuses on that intersection: vertical storytelling built for phones, free-first onboarding, and clear progression mechanics that reward continuation. The core reading challenge in serialized comics is not discovery alone, but momentum. Readers start many stories and finish few when there is no strong continuity framework. That is why this platform emphasizes predictable arc structures, transparent unlock logic, and clear incentives to continue before spoilers spread.

Vertical comics succeed when visual rhythm and narrative rhythm align. In practical terms, each episode needs strong beat transitions, readable pacing, and emotional anchors that make the next chapter feel necessary. A high-performing webtoon app in Europe should help readers start quickly, return consistently, and feel ownership over their progress. It should also help creators monetize without forcing confusing bundles or opaque rules.

EU Webtoon positions itself as a webtoon alternative in Europe for readers who want premium originals and for creators who need transparent monetization. Credits and subscription are presented as continuity tools: unlock cliffhangers, maintain weekly streaks, and access bonus scenes tied to arc completion. This model mirrors strong retention patterns seen in game systems and serial media platforms, while staying readable and respectful for story-first audiences.

Why does narrative continuity matter for retention? Because waiting introduces friction in memory and motivation. When a reader pauses at a cliffhanger for too long, they lose emotional context, social momentum, and often the urge to return. By reducing that waiting friction, progression products increase completion rate and long-term engagement. In webcomics, completion is one of the strongest predictors of future conversion because readers who finish arcs are more likely to start another series immediately.

For creators, support should map directly to output quality and release consistency. Unlock-based revenue, tipping, and limited drops provide diversified income streams. Optional creator tooling plans, such as AI Studio Pro, can reduce production overhead by accelerating outlines, marketing kits, and localization drafts. The objective is not to replace creator voice, but to shorten repetitive workflows so writers and artists can spend more time on core storytelling.

From an SEO perspective, topical authority comes from depth, structure, and internal linking. A best-in-class webtoon platform should publish substantial guides about vertical comics, reader psychology, arc design, and creator monetization while connecting them to live product journeys. It should include clean metadata, canonical URLs, valid structured data, coherent navigation, and crawl-friendly route architecture for series and episodes.

European audiences are multilingual and culturally diverse. A strong platform must support that through language-aware discovery, localized metadata, and editor-curated collections that help readers find stories matching tone, genre, and reading length. Discovery should not be a random feed. It should be a guided path from first click to first completion, then into repeat reading habits.

In short, the future of webtoons in Europe is product-led storytelling: start free, continue with momentum, and support creators in ways readers understand immediately. EU Webtoon is built around that principle.`;

export default async function HomePage() {
  const [trending, recentlyStarted, bingeNow] = await Promise.all([
    getCollectionSeries("trending", 6),
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
        }}
      />

      <HomeHero />

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Started by 12,000+ readers this week</h2>
        <p className="mt-2 text-sm text-slate-600">Trending this week · Recently started · Binge-worthy now</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trending.slice(0, 3).map((s, index) => (
            <article key={s.slug} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">
                {index === 0 ? "Trending this week" : index === 1 ? "Recently started" : "Binge-worthy now"}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">Free Episodes Available: 2</p>
              <p className="mt-1 text-sm text-slate-600">Next Episode Locked in 2 days</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/series/${s.slug}`} className="cta-secondary px-3 py-2 text-xs">Continue Reading</Link>
                <Link href="/pricing" className="cta-primary px-3 py-2 text-xs">Unlock Early</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">You’ve got 3 episodes waiting</h2>
        <p className="mt-2 text-sm text-slate-600">Progress you already started is waiting for you now.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Episode 1", "Free", "Start now"],
            ["Episode 2", "Free", "Continue now"],
            ["Episode 3", "Locked", "Unlock early with 1 Arc Pass"],
          ].map(([label, status, cta]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className={`mt-1 text-xs font-semibold ${status === "Locked" ? "text-amber-700" : "text-emerald-700"}`}>{status}</p>
              <p className="mt-3 text-sm text-slate-600">{cta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell rounded-3xl border border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-semibold tracking-tight">Stay Ahead of the Drop</h2>
        <p className="mt-2 text-sm text-slate-700">Unlock episodes before public release. Support creators directly. Never lose your reading streak. Finish arcs before they go trending.</p>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">What happens if you don’t unlock:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
            <li>Wait 7 days for release</li>
            <li>Risk spoilers</li>
            <li>Lose streak bonus</li>
            <li>Miss bonus scenes</li>
          </ul>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Arc Pass = Narrative Progression</h2>
        <p className="mt-2 text-sm text-slate-600">Arc Pass keeps continuity active so readers finish arcs, protect streak bonuses, and unlock bonus POV scenes before expiry.</p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <li>• Finish arcs instantly</li>
          <li>• Read future episodes early</li>
          <li>• Support your favorite creator</li>
          <li>• Maintain your weekly streak</li>
          <li>• Unlock bonus content</li>
        </ul>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["Starter Arc Pass", "1 Arc", "€4.99"],
            ["Reader Arc Pass", "3 Arcs", "€12.99"],
            ["Binge Arc Pass", "8 Arcs", "€29.99"],
          ].map(([name, credits, price]) => (
            <div key={name} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold">{name}</p>
              <p className="mt-2 text-xl font-bold">{credits}</p>
              <p className="text-sm text-slate-600">{price}</p>
            </div>
          ))}
        </div>
      </section>


      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Free vs Credits vs Subscription</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Plan</th><th className="py-2">What you get now</th><th className="py-2">What you lose by waiting</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100"><td className="py-2">Free</td><td>Episode 1-2 access</td><td>Arc continuity and bonus scenes expire</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2">Credits</td><td>Unlock cliffhangers on demand</td><td>Pay per unlock without monthly drip perks</td></tr>
              <tr><td className="py-2">Subscription</td><td>Monthly credit drip + early drops</td><td>None during active month</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-shell grid gap-4 md:grid-cols-2">
        <WaitlistCapture type="reader" />
        <WaitlistCapture type="creator" />
      </section>

      <section className="section-shell text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Don’t wait for public release.</h2>
        <p className="mt-2 text-lg text-slate-700">Start reading free now.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/webtoons" className="cta-primary">Start reading free</Link>
          <Link href="/pricing" className="cta-secondary">Unlock with Arc Pass</Link>
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">European webtoons guide</h2>
        <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-sm text-slate-700">{seoEssay}</div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">Continue now</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentlyStarted.slice(0, 3).concat(bingeNow.slice(0, 3)).slice(0, 6).map((s) => (
            <article key={s.slug} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">Arc completion ready: 72% · Next drop locked in 2 days.</p>
              <Link href={`/series/${s.slug}`} className="cta-secondary mt-3 px-3 py-2 text-xs">Continue reading</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
