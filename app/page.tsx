// app/page.tsx
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "OK — Home route works",
  description: "Sanity check: the home route is reachable on Vercel.",
  alternates: { canonical: absoluteUrl("/") },
};

export default function HomePage() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight">
        OK — Home route works
      </h1>
      <p className="text-neutral-700">
        This is a sanity route to confirm the deployment is serving the root
        page correctly.
      </p>
    </section>
  );
}
