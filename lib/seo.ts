// lib/seo.ts
import type { Metadata } from "next";
import { site } from "./site";

export function absoluteUrl(path = "/") {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${site.url}${path}`;
}

export function baseMetadata(): Metadata {
  const title = site.name;
  const description = site.description;

  return {
    metadataBase: new URL(site.url),
    title: {
      default: title,
      template: `%s | ${site.shortName}`,
    },
    description,
    applicationName: site.shortName,
    alternates: {
      canonical: site.url,
    },
    openGraph: {
      type: "website",
      url: site.url,
      siteName: site.shortName,
      title,
      description,
      locale: site.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: "/icon.png",
      apple: "/apple-touch-icon.png",
      shortcut: "/favicon.ico",
    },
    other: {
      "theme-color": site.themeColor,
    },
  };
}
