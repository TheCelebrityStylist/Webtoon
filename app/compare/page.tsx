import type { Metadata } from "next";
import Link from "next/link";
import { ComparisonTable } from "@/components/ComparisonTable";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Compare EU Webtoon vs Wattpad, WEBTOON, Foretelling",
  description: "See how EU Webtoon combines Wattpad-like discovery and community with Foretelling-style completion and monetization mechanics.",
  alternates: { canonical: absoluteUrl("/compare") },
};

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Comparison: why EU Webtoon is different</h1>
        <p className="mt-2 text-sm text-slate-600">Wattpad for discovery, WEBTOON for visual serials, Foretelling for progression. EU Webtoon combines all three strengths in one coherent product.</p>
      </section>
      <ComparisonTable />
      <section className="section-shell grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">Use <strong>/readers</strong> if you want community + completion loops.</div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">Use <strong>/creators</strong> if you want monetization + analytics + tooling.</div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">Use <strong>/pricing</strong> to compare reader and creator plans.</div>
      </section>
      <div className="section-shell">
        <Link href="/readers" className="cta-primary">Open Reader track</Link>
      </div>
    </div>
  );
}
