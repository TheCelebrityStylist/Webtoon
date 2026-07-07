import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "PanelForge is a creator-first platform for publishing, reading, and monetizing vertical webtoons and serialized stories.",
  alternates: { canonical: absoluteUrl("/about") },
};

const pillars = [
  {
    title: "For readers",
    body: "Discover mobile-first series, follow creators, build a library, and unlock early-access episodes through credits.",
  },
  {
    title: "For creators",
    body: "Launch series, publish episodes, schedule releases, track performance, and earn from paid unlocks.",
  },
  {
    title: "For studios",
    body: "Develop story worlds, test new formats, and grow audiences through a webtoon-native publishing workflow.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          About {site.shortName}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
          A publishing platform for the next generation of vertical stories.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          {site.shortName} combines a polished reader experience with creator tools, paid episode access, and an AI-assisted studio for planning serialized worlds.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/series"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Browse series
          </Link>
          <a
            href={`mailto:${site.creatorEmail}`}
            className="rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Apply as creator
          </a>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
