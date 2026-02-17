"use client";

import Link from "next/link";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function HomeHero() {
  useEffect(() => {
    trackEvent("hero_seen", { funnel: "discovery-hook-progress-lock-unlock" });
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.1),transparent_42%)]" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Start • Continue • Unlock</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Start your next series in under 10 seconds.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-700">
          Free first episodes. Unlock the next drop before anyone else with Arc Pass.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/webtoons" className="cta-primary" onClick={() => trackEvent("hero_start_reading_click")}>Start reading free</Link>
          <Link href="/webtoons" className="cta-secondary" onClick={() => trackEvent("hero_continue_trending_click")}>Continue a trending series</Link>
        </div>
        <ul className="mt-6 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <li>• Free episodes available now</li>
          <li>• Weekly locked drops</li>
          <li>• Early arc access via Arc Pass</li>
        </ul>
      </div>
    </section>
  );
}
