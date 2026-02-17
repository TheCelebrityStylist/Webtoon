"use client";

import { useMemo, useState } from "react";

type Track = "reader" | "creator";

const readerSteps = [
  "Pick a series by genre, language, and mood.",
  "Read free episodes instantly.",
  "Track Arc Lane progress and streak continuity.",
  "Unlock early with credits when tension spikes.",
  "Get bonus POV scenes, creator notes, concept extras.",
  "Finish arcs and share completion in community shelves.",
  "Discuss with readers and follow creators for next drops.",
];

const creatorSteps = [
  "Apply and onboard your series profile.",
  "Upload vertical episodes with arc structure.",
  "Set release cadence and unlock windows.",
  "Monetize via unlocks, tips, and bundles.",
  "Monitor retention, conversion, and drop-off signals.",
  "Use AI Studio Pro for pacing and marketing assets.",
  "Receive payouts with rights clarity and analytics exports.",
];

export function HowItWorksSection({ defaultTrack = "reader", large = false }: { defaultTrack?: Track; large?: boolean }) {
  const [track, setTrack] = useState<Track>(defaultTrack);
  const steps = useMemo(() => (track === "reader" ? readerSteps : creatorSteps), [track]);

  return (
    <section className={`section-shell ${large ? "space-y-6" : "space-y-4"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`${large ? "text-4xl" : "text-2xl"} font-semibold tracking-tight`}>How it works</h2>
        <div className="inline-flex rounded-full border border-slate-300 bg-slate-100 p-1">
          <button className={`rounded-full px-3 py-1 text-xs font-semibold ${track === "reader" ? "bg-white shadow" : "text-slate-600"}`} onClick={() => setTrack("reader")}>Reader flow</button>
          <button className={`rounded-full px-3 py-1 text-xs font-semibold ${track === "creator" ? "bg-white shadow" : "text-slate-600"}`} onClick={() => setTrack("creator")}>Creator flow</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Progress</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {steps.map((step, i) => (
                <li key={step} className="rounded-md bg-slate-50 px-2 py-1">Step {i + 1}</li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((step, i) => (
            <article key={step} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">Step {i + 1}</p>
              <p className="mt-1 text-sm text-slate-700">{step}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
