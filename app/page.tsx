import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "EU Webtoon | Reader + Creator platform",
  description: "Two products in one: a reader platform for discovery and completion, and a creator platform for publishing, monetization, and analytics.",
  alternates: { canonical: absoluteUrl("/") },
};

export default function RouterHome() {
  return (
    <div className="space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "EU Webtoon", url: absoluteUrl("/") }} />
      <section className="section-shell text-center">
        <h1 className="text-4xl font-bold tracking-tight">I’m here to read or publish</h1>
        <p className="mt-3 text-slate-600">EU Webtoon combines a Wattpad-like reader community with a Foretelling-like creator growth stack.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/readers" className="cta-primary">I’m here to read</Link>
          <Link href="/creators" className="cta-secondary">I’m here to publish</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-2xl font-semibold">Reader platform</h2>
          <p className="mt-2 text-sm text-slate-600">Discover series, read free starts, keep momentum with Continuity Lane, and finish arcs before spoiler spread.</p>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
            <li>Community discovery + shelves + reviews</li>
            <li>Arc completion mechanics + bonus unlocks</li>
            <li>Credits, subscriptions, and bundle options</li>
          </ul>
          <Link href="/readers" className="cta-secondary mt-4">Open Reader track</Link>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-2xl font-semibold">Creator platform</h2>
          <p className="mt-2 text-sm text-slate-600">Ship vertical series, monetize with unlocks and tips, and use AI Studio + analytics to improve completion and earnings.</p>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
            <li>Publishing workflow and release controls</li>
            <li>Revenue streams + payout clarity</li>
            <li>Creator portal analytics and optimization cues</li>
          </ul>
          <Link href="/creators" className="cta-secondary mt-4">Open Creator track</Link>
        </article>
      </section>
    </div>
  );
}
