import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Access Pass | EU Webtoon",
  description: "Use Access Pass credits to continue instantly, stay ahead of drops, and support creators when you unlock.",
  alternates: { canonical: absoluteUrl("/pricing") },
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell">
        <h1 className="text-3xl font-semibold tracking-tight">Access Pass pricing</h1>
        <p className="mt-2 text-sm text-slate-600">Access Pass credits are access tokens for progression, not a subscription. Use them when you want to stay ahead.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["Starter Access Pass", "10 credits", "€4.99", "Finish a key arc beat now"],
            ["Reader Access Pass", "30 credits", "€12.99", "Maintain your weekly streak", true],
            ["Binge Access Pass", "80 credits", "€29.99", "Continue multiple series instantly"],
            ["Season Access Pass", "200 credits", "€59.99", "Stay ahead every week"],
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
        <h2 className="text-2xl font-semibold tracking-tight">With Access Pass you can</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <li>• Finish arcs instantly</li>
          <li>• Read future episodes early</li>
          <li>• Support your favorite creator</li>
          <li>• Maintain your weekly streak</li>
          <li>• Unlock bonus content</li>
        </ul>
      </section>
    </div>
  );
}
