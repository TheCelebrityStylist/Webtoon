"use client";

import { useState } from "react";

export function PricingToggle() {
  const [tab, setTab] = useState<"reader" | "creator">("reader");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-slate-300 bg-slate-100 p-1">
        <button className={`rounded-full px-3 py-1 text-xs font-semibold ${tab === "reader" ? "bg-white shadow" : "text-slate-600"}`} onClick={() => setTab("reader")}>Reader pricing</button>
        <button className={`rounded-full px-3 py-1 text-xs font-semibold ${tab === "creator" ? "bg-white shadow" : "text-slate-600"}`} onClick={() => setTab("creator")}>Creator pricing</button>
      </div>

      {tab === "reader" ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Free</p><p className="mt-1 text-sm text-slate-600">Start episodes and community access.</p><p className="mt-2 text-xs">Who it’s for: new readers.</p></div>
            <div className="rounded-xl border border-indigo-500 bg-indigo-50 p-4"><p className="font-semibold">Continuity+</p><p className="mt-1 text-sm text-slate-700">Monthly credit drip, streak protection, discounted unlocks.</p><p className="mt-2 text-xs">Who it’s for: weekly readers.</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Credit Packs</p><p className="mt-1 text-sm text-slate-600">10 / 30 / 80 credits, pay as needed.</p><p className="mt-2 text-xs">Who it’s for: selective unlockers.</p></div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-semibold">Comparison rows</p>
            <ul className="mt-2 list-disc pl-5 text-slate-700">
              <li>Unlock speed: Free &lt; Credits &lt; Continuity+</li>
              <li>Streak protection: Continuity+ best</li>
              <li>Cost flexibility: Credits best</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Creator Basic</p><p className="mt-1 text-sm text-slate-600">Publishing + baseline analytics.</p><p className="mt-2 text-xs">Who it’s for: solo starters.</p></div>
            <div className="rounded-xl border border-indigo-500 bg-indigo-50 p-4"><p className="font-semibold">Creator Pro</p><p className="mt-1 text-sm text-slate-700">AI Studio Pro, cover generation, pacing assistant, marketing kit.</p><p className="mt-2 text-xs">Who it’s for: weekly launch teams.</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold">Creator Studio+</p><p className="mt-1 text-sm text-slate-600">Team seats, featured launches, advanced analytics and localization support.</p><p className="mt-2 text-xs">Who it’s for: studio operators.</p></div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-semibold">Comparison rows</p>
            <ul className="mt-2 list-disc pl-5 text-slate-700">
              <li>Tool depth: Basic &lt; Pro &lt; Studio+</li>
              <li>Launch support: Studio+ strongest</li>
              <li>Cost efficiency: Pro strongest for growing creators</li>
            </ul>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p className="font-semibold">Pricing FAQ</p>
        <ul className="mt-2 list-disc pl-5 text-slate-700">
          <li>Can readers cancel Continuity+ anytime? Yes.</li>
          <li>Do creators keep rights? Yes, with clear contract terms.</li>
          <li>Can creators add premium POV scenes? Yes, as optional add-ons.</li>
        </ul>
      </div>
    </div>
  );
}
