import { redirect } from "next/navigation";
import { getSeriesBySlug } from "@/lib/data";

export default async function LegacySeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) redirect("/webtoons");
  redirect(`/series/${series.slug}`);
}
