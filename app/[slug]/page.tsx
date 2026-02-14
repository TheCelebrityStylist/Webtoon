import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSeriesBySlug } from "@/lib/data";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
  return series ? { title: `${series.title} | EU Webtoon`, description: series.description } : {};
}

export default async function LegacySlugPage({ params }: { params: { slug: string } }) {
  const series = await getSeriesBySlug(params.slug);
  if (!series) redirect("/series");
  redirect(`/series/${series.slug}`);
}
