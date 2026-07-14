import type { MetadataRoute } from "next"; import { site } from "@/lib/site";
export const publicRoutes = ["/", "/about", "/discover", "/search", "/sign-in", "/sign-up"] as const;
export default function sitemap(): MetadataRoute.Sitemap { return publicRoutes.map((path) => ({ url: `${site.url}${path === "/" ? "" : path}`, lastModified: new Date(), changeFrequency: path === "/discover" ? "daily" : "monthly", priority: path === "/" ? 1 : 0.6 })); }
