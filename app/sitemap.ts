import { MetadataRoute } from "next";
import { series } from "@/lib/data";

const site = {
  url: "https://yourdomain.com",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const seriesUrls: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${site.url}/series/${s.slug}`,
    lastModified: new Date(), // ← no updatedAt dependency
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...seriesUrls,
  ];
}

