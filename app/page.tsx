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
    "Start reading free episodes now, continue your progression, and unlock early drops with Access Pass before public release.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "EU Webtoon",
    description: "Start free, continue your arc, and stay ahead of weekly drops with Access Pass.",
    url: absoluteUrl("/"),
  },
};

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
            ["Episode 3", "Locked", "Unlock early with 5 credits"],
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
        <h2 className="text-2xl font-semibold tracking-tight">Access Pass (Access Tokens) = Progression</h2>
        <p className="mt-2 text-sm text-slate-600">Access Pass is how readers stay ahead, finish what they start, and fund the next episode.</p>
        <ul className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <li>• Finish arcs instantly</li>
          <li>• Read future episodes early</li>
          <li>• Support your favorite creator</li>
          <li>• Maintain your weekly streak</li>
          <li>• Unlock bonus content</li>
        </ul>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["Starter Access Pass", "10 credits", "€4.99"],
            ["Reader Access Pass", "30 credits", "€12.99"],
            ["Binge Access Pass", "80 credits", "€29.99"],
          ].map(([name, credits, price]) => (
            <div key={name} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold">{name}</p>
              <p className="mt-2 text-xl font-bold">{credits}</p>
              <p className="text-sm text-slate-600">{price}</p>
            </div>
          ))}
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
          <Link href="/series" className="cta-primary">Start reading free</Link>
          <Link href="/pricing" className="cta-secondary">Unlock with Access Pass</Link>
        </div>
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
