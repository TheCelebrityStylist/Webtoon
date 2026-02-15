"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { getVariant } from "@/lib/ab";
import { trackEvent } from "@/lib/analytics";

export function HomeHero() {
  const variant = useMemo(() => getVariant(), []);

  useEffect(() => {
    trackEvent("hero_variant_seen", { variant });
  }, [variant]);

  const content = {
    A: {
      headline: "Read Europe’s next breakout webtoons before everyone else.",
      cta: "Start reading free",
      sub: "Mobile-first episodes, weekly drops, and transparent Fast Pass credits.",
    },
    B: {
      headline: "Free episode one. Premium stories. Zero subscription pressure.",
      cta: "Open the library",
      sub: "Read now, unlock early only when a cliffhanger wins.",
    },
    C: {
      headline: "The highest-signal webtoon home for European creators.",
      cta: "Browse trending series",
      sub: "Editorially curated launches with clean reading UX and creator-first economics.",
    },
  }[variant];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.09),transparent_40%)]" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Pilot cohort · conversion-first MVP</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">{content.headline}</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-700">{content.sub}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/series" className="cta-primary" onClick={() => trackEvent("hero_primary_click", { variant })}>{content.cta}</Link>
          <Link href="/ai-stylist" className="cta-secondary" onClick={() => trackEvent("hero_secondary_click", { variant })}>Explore AI Studio</Link>
        </div>
        <ul className="mt-6 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <li>✔ Episode 1 is free on every launch title</li>
          <li>✔ Fast Pass credits, no monthly subscription lock</li>
          <li>✔ Creator-friendly rights and transparent reporting</li>
        </ul>
      </div>
    </section>
  );
}
