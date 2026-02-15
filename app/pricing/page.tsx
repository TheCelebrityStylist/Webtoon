import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing & Credits | EU Webtoon",
  description: "Understand Fast Pass credits, packs, and unlocking options. No subscription required.",
  alternates: { canonical: absoluteUrl("/pricing") },
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Fast Pass credits pricing (MVP)</h1>
        <p className="mt-2 text-sm text-slate-600">Transparent credit packs. Buy only when you want early access.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["Starter", "10 credits", "€4.99", "Try one or two unlocks"],
            ["Reader", "30 credits", "€12.99", "Most popular"],
            ["Binge", "80 credits", "€29.99", "Best for multi-series reading"],
            ["Season", "200 credits", "€59.99", "For heavy weekly readers"],
          ].map(([name, credits, price, note]) => (
            <div key={name} className={`rounded-xl border p-4 ${name === "Reader" ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <p className="font-semibold">{name}</p>
              <p className="mt-1 text-xl font-bold">{credits}</p>
              <p className="text-sm text-slate-600">{price}</p>
              <p className="mt-1 text-xs text-slate-500">{note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
