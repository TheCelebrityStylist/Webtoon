export const brand = {
  name: "Morrow",
  shortName: "Morrow",
  descriptor: "A beautiful place to build, write, and finish your story",
  promise: "Everything you need to build, write, and finish a story that stays consistent.",
  marks: { symbol: "m", wordmark: "morrow" },
  colors: {
    ink: "#231b2b", cream: "#fff9ed", plum: "#54304f", coral: "#e86f61",
    butter: "#f4c95d", lilac: "#c9b6e4", sage: "#a8b99a",
  },
} as const;

export const site = {
  name: brand.name,
  shortName: brand.shortName,
  description: brand.promise,
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "en",
  supportedLocales: ["en", "nl", "de", "es", "pt"],
  themeColor: brand.colors.cream,
} as const;
