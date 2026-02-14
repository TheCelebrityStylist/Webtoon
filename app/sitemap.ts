import type { MetadataRoute } from "next";
import { getAllSeries } from "@/lib/data";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await getAllSeries();

  const root: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/series`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/ai-stylist`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const seriesUrls = all.map((series) => ({
    url: `${site.url}/series/${series.slug}`,
    lastModified: new Date(series.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const episodeUrls = all.flatMap((series) =>
    series.episodes.map((episode) => ({
      url: `${site.url}/series/${series.slug}/read/${episode.ep}`,
      lastModified: new Date(series.updatedAt),
      changeFrequency: "weekly" as const,
      priority: episode.isFree ? 0.7 : 0.5,
    })),
  );

  return [...root, ...seriesUrls, ...episodeUrls];
}
