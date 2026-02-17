import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "For creators | EU Webtoon",
  description: "Creator-first publishing with revenue share, unlock analytics, optional AI Studio Pro tools, and transparent payouts.",
  alternates: { canonical: absoluteUrl("/for-creators") },
};

export default function ForCreatorsPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Creator monetization stack</h1>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Revenue share on every unlock</li>
          <li>Tips, bundles, and limited drops</li>
          <li>Optional AI Studio Pro tools plan</li>
          <li>Sponsored placements with clear labeling controls</li>
        </ul>
        <div className="mt-4 flex gap-3">
          <Link href="/creators" className="cta-secondary">Apply now</Link>
          <Link href="/pricing" className="cta-primary">Creator plans</Link>
        </div>
      </section>
    </div>
  );
}
