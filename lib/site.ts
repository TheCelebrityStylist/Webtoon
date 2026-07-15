export const brand = {
  name: "Asterism",
  shortName: "Asterism",
  descriptor: "Story intelligence for serious writers",
  promise: "See the whole story. Change it with confidence.",
  legalStatus: "Working name — trademark and domain availability unverified",
  marks: { symbol: "✦", wordmark: "ASTERISM" },
  colors: {
    void: "#080b10",
    paper: "#f2f0e9",
    signal: "#d9ff43",
    violet: "#9d8cff",
    ice: "#9ee7ff",
  },
} as const;

export const site = {
  name: brand.name,
  shortName: brand.shortName,
  description:
    "A private story-intelligence workspace connecting manuscript, canon, causality, continuity, and revision.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "en",
  supportedLocales: ["en", "nl", "de", "es", "pt"],
  themeColor: brand.colors.void,
} as const;
