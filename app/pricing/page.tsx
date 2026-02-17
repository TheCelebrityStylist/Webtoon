import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Arc Pass | EU Webtoon",
  description: "Arc Pass keeps your continuity lane active so you can finish arcs, protect streaks, and unlock cliffhanger progression.",
  alternates: { canonical: absoluteUrl("/pricing") },
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Arc Pass pricing</h1>
        <p className="mt-2 text-sm text-slate-600">Arc Pass is narrative progression. Unlocking is the fastest path to maintain continuity, streak bonuses, and bonus scene eligibility.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["Starter Arc Pass", "1 Arc", "€4.99", "Continue your active arc now"],
            ["Reader Arc Pass", "3 Arcs", "€12.99", "Maintain weekly streak momentum", true],
            ["Binge Arc Pass", "8 Arcs", "€29.99", "Finish multiple cliffhanger arcs instantly"],
            ["Completion Pass", "Full Season", "€59.99", "Protect full-series continuity"],
          ].map(([name, credits, price, note, popular]) => (
            <div key={String(name)} className={`rounded-xl border p-4 ${popular ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <p className="font-semibold">{name}</p>
              <p className="mt-1 text-xl font-bold">{credits}</p>
              <p className="text-sm text-slate-600">{price}</p>
              <p className="mt-1 text-xs text-slate-500">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell rounded-2xl border border-slate-200 bg-slate-50">
        <h2 className="text-2xl font-semibold tracking-tight">With Arc Pass you can</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <li>• Finish arcs instantly</li>
          <li>• Read future episodes before public release</li>
          <li>• Protect your reading streak bonuses</li>
          <li>• Keep continuity bonus active</li>
          <li>• Unlock POV scenes, commentary, and epilogues</li>
        </ul>
      </section>
    </div>
  );
}
