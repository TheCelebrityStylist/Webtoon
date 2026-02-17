import { redirect } from "next/navigation";
import { getSeriesBySlug } from "@/lib/data";

export default async function LegacySeriesPage({ params }: { params: { slug: string } }) {
  const series = await getSeriesBySlug(params.slug);
  if (!series) redirect("/webtoons");
  redirect(`/series/${series.slug}`);
}
