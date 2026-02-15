import type { MetadataRoute } from "next";
import { getAllEpisodeRoutes, getAllSeries } from "@/lib/data";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allSeries, episodeRoutes] = await Promise.all([getAllSeries(), getAllEpisodeRoutes()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/series`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${site.url}/ai-stylist`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${site.url}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/creators`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${site.url}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
  ];

  const seriesRoutes = allSeries.map((series) => ({
    url: `${site.url}/series/${series.slug}`,
    lastModified: new Date(series.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.86,
  }));

  const episodeList = episodeRoutes.map((route) => ({
    url: `${site.url}/series/${route.slug}/read/${route.ep}`,
    lastModified: new Date(route.updatedAt),
    changeFrequency: "weekly" as const,
    priority: route.isFree ? 0.76 : 0.58,
  }));

  return [...staticRoutes, ...seriesRoutes, ...episodeList];
}
