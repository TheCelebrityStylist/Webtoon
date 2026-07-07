import type { MetadataRoute } from "next";
import { getAllSeries } from "@/lib/data";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const allSeries = getAllSeries();
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${site.url}/series`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${site.url}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const seriesRoutes: MetadataRoute.Sitemap = allSeries.map((item) => ({
    url: `${site.url}/series/${item.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...routes, ...seriesRoutes];
}
