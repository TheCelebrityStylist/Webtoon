import { redirect } from "next/navigation";
import { getSeriesBySlug } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export default async function LegacySeriesPage({ params }: Props) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);
  if (!series) redirect("/webtoons");
  redirect(`/series/${series.slug}`);
}
