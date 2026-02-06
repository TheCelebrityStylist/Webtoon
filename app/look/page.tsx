import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { StylistClient } from "@/components/StylistClient";

export const metadata: Metadata = {
  title: "AI Stylist",
  description:
    "Premium AI stylist curated from real EU retailers. Get a complete look with live products.",
  alternates: { canonical: absoluteUrl("/look") },
};

export default function LookPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">AI Stylist</h1>
        <p className="text-neutral-700">
          Describe your vibe, budget, and occasion. We’ll curate real, shoppable
          pieces across premium EU retailers.
        </p>
      </div>
      <StylistClient />
    </div>
  );
}
