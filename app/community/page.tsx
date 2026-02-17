import Image from "next/image";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Community | EU Webtoon",
  description: "Reader discussions, trending tropes, shelves, reviews, and follow tools for creators and series.",
  alternates: { canonical: absoluteUrl("/community") },
};

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <section className="section-shell grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reader community</h1>
          <p className="mt-2 text-sm text-slate-600">Discuss arcs, share shelves, follow creators, and write reviews that help others find their next obsession.</p>
        </div>
        <Image src="/illustrations/community.svg" alt="Community illustration" width={1200} height={800} className="rounded-xl border border-slate-200 bg-white" />
      </section>
      <section className="section-shell grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-semibold">Discussion prompts</h2><p className="mt-2 text-sm text-slate-600">Was the episode-3 betrayal justified? Which arc handled moral trade-offs better?</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-semibold">Trending tropes</h2><p className="mt-2 text-sm text-slate-600">Time debt, royal fraud, border noir, found-family conspiracies.</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-semibold">Reader shelves</h2><p className="mt-2 text-sm text-slate-600">Currently reading · Finished arcs · Favorites.</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="font-semibold">Actions</h2><p className="mt-2 text-sm text-slate-600">Write a review · Add to shelf · Follow creator · Follow series.</p></article>
      </section>
    </div>
  );
}
