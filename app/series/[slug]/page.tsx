import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EpisodeList } from "@/components/EpisodeList";
import { JsonLd } from "@/components/JsonLd";
import { SeriesCard } from "@/components/SeriesCard";
import { WaitlistCapture } from "@/components/WaitlistCapture";
import { getAllSeries, getSeriesBySlug } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
  if (!series) return {};

  return {
    title: `${series.title} | EU Webtoon`,
    description: series.description,
    alternates: { canonical: absoluteUrl(`/series/${series.slug}`) },
    openGraph: {
      title: series.title,
      description: series.description,
      url: absoluteUrl(`/series/${series.slug}`),
      images: [absoluteUrl(series.coverUrl)],
    },
  };
}

export default async function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const [series, all] = await Promise.all([getSeriesBySlug(params.slug), getAllSeries()]);
  if (!series) return notFound();

  const firstFree = series.episodes.find((e) => e.isFree);
  const similar = all.filter((item) => item.slug !== series.slug && item.genres.some((g) => series.genres.includes(g))).slice(0, 6);

  return (
    <div className="space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWorkSeries",
          name: series.title,
          description: series.longDescription,
          inLanguage: series.language,
          url: absoluteUrl(`/series/${series.slug}`),
          genre: series.genres,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Series", item: absoluteUrl("/series") },
            { "@type": "ListItem", position: 3, name: series.title, item: absoluteUrl(`/series/${series.slug}`) },
          ],
        }}
      />
      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-[280px_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
          <Image src={series.coverUrl} alt={series.coverAlt} fill sizes="(max-width:768px) 100vw, 280px" className="object-cover" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-700">{series.language.toUpperCase()} · {series.genres.join(" · ")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{series.title}</h1>
          <p className="mt-1 text-sm text-slate-500">By {series.creatorName}</p>
          <p className="mt-4 text-sm text-slate-700">{series.hook}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {series.tags.map((tag) => <span key={tag} className="pill">#{tag}</span>)}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{series.stats.readsBeta.toLocaleString()}</strong><br />beta reads</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{series.stats.likesBeta.toLocaleString()}</strong><br />beta likes</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{series.stats.ratingBeta.toFixed(2)}</strong><br />beta rating</div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{series.episodes.length}</strong><br />episodes live</div>
          </div>
          {firstFree ? <Link href={`/series/${series.slug}/read/${firstFree.ep}`} className="cta-primary mt-5">Start reading free</Link> : null}
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">About this series</h2>
        <p className="mt-3 text-sm text-slate-700">{series.longDescription}</p>
        <h3 className="mt-4 font-semibold">Why you’ll love it</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Cinematic vertical pacing optimized for mobile reading sessions.</li>
          <li>Clear free-to-start onboarding with optional Fast Pass acceleration.</li>
          <li>Character-first stakes with meaningful weekly progression.</li>
          <li>European settings and multilingual discovery context.</li>
          <li>Creator-forward economics and transparent labeling.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Episodes</h2>
        <p className="mt-1 text-sm text-slate-600">Episode 1 is free. Unlock premium chapters with Fast Pass credits when you choose.</p>
        <div className="mt-4">
          <EpisodeList series={series} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Similar series</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {similar.map((item) => <SeriesCard key={item.slug} s={item} />)}
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-xl font-semibold">Series FAQ</h2>
        {[
          ["Is this series free to start?", "Yes, the opening episode is available free in MVP."],
          ["How do Fast Pass episodes work?", "Later episodes can be unlocked early using credits with no subscription lock."],
          ["How often does this series update?", "The release target is weekly during beta."],
          ["Can I share episode links?", "Yes, every episode has a clean URL for sharing."],
          ["Who owns this story?", "Creators retain rights for original work under MVP terms."],
        ].map(([q, a]) => (
          <details key={q} className="mt-2 rounded-xl border border-slate-200 p-3">
            <summary className="cursor-pointer font-medium">{q}</summary>
            <p className="mt-2 text-sm text-slate-600">{a}</p>
          </details>
        ))}
      </section>

      <section className="section-shell">
        <WaitlistCapture type="reader" />
      </section>

      <Link href={`/series/${series.slug}/read/${firstFree?.ep ?? 1}`} className="fixed bottom-20 left-4 right-4 z-40 rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg md:hidden">
        Start reading free
      </Link>
    </div>
  );
}
