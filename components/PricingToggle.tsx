"use client";

import Link from "next/link";
import { useState } from "react";

type Track = "reader" | "creator";

type Tier = {
  name: string;
  price: string;
  forWho: string;
  outcomes: string;
  includes: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

const readerTiers: Tier[] = [
  {
    name: "Free",
    price: "€0",
    forWho: "New readers",
    outcomes: "Start instantly, test stories, and build your shelf.",
    includes: ["Free episode starts", "Community shelves + reviews", "Arc lane preview"],
    cta: { label: "Start reading free", href: "/webtoons" },
  },
  {
    name: "Continuity+",
    price: "€9.99/mo",
    forWho: "Weekly readers",
    outcomes: "Protect streaks and unlock payoffs before spoilers spread.",
    includes: ["Monthly credit drip", "Streak protection", "Bonus scene priority", "Cheaper early unlocks"],
    cta: { label: "Get Continuity+", href: "/pricing#reader-faq" },
    featured: true,
  },
  {
    name: "Superfan",
    price: "€19.99/mo",
    forWho: "Binge completists",
    outcomes: "Finish arcs fast and support creators directly.",
    includes: ["Everything in Continuity+", "Monthly arc bundle", "Creator tip match credits"],
    cta: { label: "Unlock your first Arc Pass", href: "/pricing#credit-packs" },
  },
];

const creatorTiers: Tier[] = [
  {
    name: "Starter",
    price: "€0",
    forWho: "First launch",
    outcomes: "Ship your first vertical series with reliable release controls.",
    includes: ["Episode upload + scheduling", "Basic funnel analytics", "Tips + unlock monetization"],
    cta: { label: "Apply to Creator Program", href: "/creators#apply" },
  },
  {
    name: "Creator Pro",
    price: "€29/mo",
    forWho: "Weekly publishers",
    outcomes: "Increase completion and unlock conversion with actionable tools.",
    includes: ["Retention heatmaps", "Cliffhanger scoring", "Pricing experiments", "Studio tools"],
    cta: { label: "Open creator portal", href: "/creator-portal" },
    featured: true,
  },
  {
    name: "Studio+",
    price: "€79/mo",
    forWho: "Teams and labels",
    outcomes: "Run multi-series launches with predictable earnings dashboards.",
    includes: ["Team seats", "Advanced promotion slots", "Localization workflow", "Revenue forecast exports"],
    cta: { label: "Talk to partnerships", href: "/creators#apply" },
  },
];

function TierCard({ tier }: { tier: Tier }) {
  return (
    <article className={`rounded-2xl border p-5 ${tier.featured ? "border-indigo-500 bg-indigo-50 shadow-lg" : "border-slate-200 bg-white"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{tier.forWho}</p>
      <h3 className="mt-2 text-xl font-semibold">{tier.name}</h3>
      <p className="mt-1 text-2xl font-bold">{tier.price}</p>
      <p className="mt-3 text-sm text-slate-700">{tier.outcomes}</p>
      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {tier.includes.map((item) => <li key={item}>• {item}</li>)}
      </ul>
      <Link href={tier.cta.href} className="cta-primary mt-5">{tier.cta.label}</Link>
    </article>
  );
}

export function PricingToggle() {
  const [tab, setTab] = useState<Track>("reader");
  const tiers = tab === "reader" ? readerTiers : creatorTiers;

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-full border border-slate-300 bg-slate-100 p-1">
        <button className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === "reader" ? "bg-white shadow" : "text-slate-600"}`} onClick={() => setTab("reader")}>For Readers</button>
        <button className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === "creator" ? "bg-white shadow" : "text-slate-600"}`} onClick={() => setTab("creator")}>For Creators</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => <TierCard key={tier.name} tier={tier} />)}
      </div>

      <div id="credit-packs" className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Credits, bundles, tips, and subscriptions</p>
        <p className="mt-2">Reader credit packs: 10 (€4.99), 30 (€12.99), 80 (€29.99). Arc bundles unlock full mini-arcs at a discount. Tips go directly to creators, and creator subscriptions unlock behind-the-scenes drops.</p>
      </div>
    </div>
  );
}
