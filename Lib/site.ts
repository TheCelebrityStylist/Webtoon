// lib/site.ts
export const site = {
  name: "EU Webtoon Platform (MVP)",
  shortName: "EU Webtoon",
  description:
    "Read and publish vertical webtoons and serialized stories. Discover new European creators. Fast Pass and bonus episodes via credits.",
  // IMPORTANT: set this in Vercel project env for production:
  // NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000",
  locale: "en",
  twitterHandle: "@yourhandle",
  themeColor: "#111111",
};
