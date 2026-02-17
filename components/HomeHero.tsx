"use client";

import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="section-shell grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-[1.1fr_1fr] md:p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Wattpad × Foretelling (on steroids)</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Finish arcs. Don’t wait.</h1>
        <p className="mt-4 text-base text-slate-700">European originals built for vertical binge reading. Start free, then stay ahead with Continuity+ and Arc Pass credits.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/readers" className="cta-primary">For Readers</Link>
          <Link href="/creators" className="cta-secondary">For Creators</Link>
        </div>
        <ul className="mt-6 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <li>• Unlock 5 days early</li>
          <li>• Keep your streak</li>
          <li>• Bonus POV scenes</li>
        </ul>
      </div>
      <Image src="/illustrations/reading-momentum.svg" alt="Reader momentum illustration" width={1200} height={800} className="rounded-2xl border border-slate-200 bg-slate-50" />
    </section>
  );
}
