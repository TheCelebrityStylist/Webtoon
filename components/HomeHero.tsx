"use client";

import Link from "next/link";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function HomeHero() {
  useEffect(() => {
    trackEvent("hero_seen", { funnel: "finish-arcs-dont-wait" });
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-10 dark:border-slate-800 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.14),transparent_42%)]" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Continuity Lane • Spoiler Shield • Creator-backed drops</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">Finish arcs. Don’t wait.</h1>
        <p className="mt-4 max-w-3xl text-base text-slate-700 dark:text-slate-300">
          European originals built for vertical binge reading. Start free, then stay ahead with Continuity+ and Arc Pass credits.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/webtoons" className="cta-primary" onClick={() => trackEvent("hero_start_reading_click")}>Start reading free</Link>
          <Link href="/pricing" className="cta-secondary" onClick={() => trackEvent("hero_get_credits_click")}>Get credits</Link>
        </div>
        <ul className="mt-6 grid gap-2 text-sm text-slate-700 md:grid-cols-3 dark:text-slate-300">
          <li>• Unlock 5 days early</li>
          <li>• Keep your streak</li>
          <li>• Bonus POV scenes</li>
        </ul>
      </div>
    </section>
  );
}
