import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How EU Webtoon works",
  description: "Learn how free episodes, Fast Pass credits, and creator economics work in EU Webtoon MVP.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-semibold tracking-tight">How EU Webtoon works</h1>
        <p className="mt-3 text-sm text-slate-700">EU Webtoon is a mobile-first reading platform for serialized European stories. We optimize for discoverability, retention, and fair creator economics from day one.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Reader experience</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Read Episode 1 for free across the library.</li>
            <li>Unlock early episodes using credits only when you want them.</li>
            <li>Keep progress on clean, indexable URLs for sharing and search.</li>
          </ul>
        </div>
        <div id="creators" className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Creator program (MVP)</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>Invite-only onboarding while tooling matures.</li>
            <li>Creators retain rights ownership of original IP.</li>
            <li>Fast Pass unlock revenue shared with transparent reporting.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
