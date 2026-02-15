import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About EU Webtoon",
  description: "Mission, editorial approach, and creator-first webtoon publishing model for European vertical comics.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About EU Webtoon",
          url: absoluteUrl("/about"),
        }}
      />
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">About EU Webtoon (MVP)</h1>
        <p className="mt-3 text-sm text-slate-700">
          EU Webtoon is building a premium home for European vertical storytelling. We focus on clean reading UX, free-to-start onboarding, and transparent Fast Pass credit mechanics that let readers support creators without subscription lock-in.
        </p>
      </section>

      <section className="section-shell">
        <h2 className="text-2xl font-semibold tracking-tight">What is a webtoon?</h2>
        <p className="mt-3 text-sm text-slate-700">
          A webtoon is a digital-first comic format designed for vertical scrolling. Instead of page turns, episodes unfold in stacked beats that feel natural on phones. This format supports cinematic pacing, controlled reveals, and one-handed reading comfort. EU Webtoon applies this format with an editorial lens: each launch is curated for clarity, quality, and long-term reader retention.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="section-shell">
          <h2 className="text-xl font-semibold">Mission and standards</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Mobile-first readability and consistent visual hierarchy.</li>
            <li>Transparent free vs Fast Pass labeling in every episode list.</li>
            <li>Weekly release cadence with clear reader expectations.</li>
            <li>SEO-first publishing so every story remains discoverable.</li>
          </ul>
        </article>
        <article className="section-shell">
          <h2 className="text-xl font-semibold">How to publish a webtoon with us</h2>
          <p className="mt-3 text-sm text-slate-700">
            During MVP, creator onboarding is invite-only. We review portfolio fit, release reliability, and audience intent. Accepted creators keep rights ownership and get support on launch packaging, pricing clarity, and collection placement. Start with the creator page to apply and join the pilot queue.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/series" className="cta-secondary px-4 py-2 text-xs">Browse series</Link>
            <Link href="/creators" className="cta-primary px-4 py-2 text-xs">Creator program</Link>
            <Link href="/ai-stylist" className="cta-secondary px-4 py-2 text-xs">AI Studio</Link>
          </div>
        </article>
      </section>
    </div>
  );
}
