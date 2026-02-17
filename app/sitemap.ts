import type { MetadataRoute } from "next";
import { getAllEpisodeRoutes, getAllSeries } from "@/lib/data";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allSeries, episodeRoutes] = await Promise.all([getAllSeries(), getAllEpisodeRoutes()]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/readers`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${site.url}/creators`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/webtoons`, lastModified: now, changeFrequency: "daily", priority: 0.92 },
    { url: `${site.url}/community`, lastModified: now, changeFrequency: "weekly", priority: 0.82 },
    { url: `${site.url}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.82 },
    { url: `${site.url}/creator-portal`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/ai-studio`, lastModified: now, changeFrequency: "weekly", priority: 0.88 },
    { url: `${site.url}/how-it-works`, lastModified: now, changeFrequency: "weekly", priority: 0.84 },
    { url: `${site.url}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.82 },
    { url: `${site.url}/faq`, lastModified: now, changeFrequency: "weekly", priority: 0.78 },
  ];

  const seriesRoutes: MetadataRoute.Sitemap = allSeries.map((s) => {
    const episodeDates = s.episodes.map((ep) => new Date(ep.publishedAt).getTime()).filter((d) => Number.isFinite(d));
    const latest = episodeDates.length ? Math.max(...episodeDates) : Date.now();

    return {
      url: `${site.url}/series/${s.slug}`,
      lastModified: new Date(latest),
      changeFrequency: "weekly",
      priority: 0.86,
    };
  });

  const episodeList: MetadataRoute.Sitemap = episodeRoutes.map((route) => ({
    url: `${site.url}/series/${route.slug}/read/${route.ep}`,
    lastModified: new Date(route.updatedAt),
    changeFrequency: "weekly",
    priority: route.isFree ? 0.76 : 0.58,
  }));

  return [...staticRoutes, ...seriesRoutes, ...episodeList];
}
