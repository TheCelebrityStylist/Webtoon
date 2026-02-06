// app/sitemap.ts
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllSeries } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const series = getAllSeries();

  const base: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${site.url}/series`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${site.url}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const seriesUrls: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${site.url}/series/${s.slug}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const episodeUrls: MetadataRoute.Sitemap = series.flatMap((s) =>
    s.episodes
      // Only include indexable (free) episodes by default
      .filter((e) => e.isFree)
      .map((e) => ({
        url: `${site.url}/series/${s.slug}/read/${e.ep}`,
        lastModified: new Date(s.updatedAt),
        changeFrequency: "weekly",
        priority: 0.6,
      })),
  );

  return [...base, ...seriesUrls, ...episodeUrls];
}
