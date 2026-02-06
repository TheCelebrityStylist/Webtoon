// lib/data.ts
export type Episode = {
  ep: number;
  title: string;
  isFree: boolean;
  publishedAt: string; // ISO
  excerpt: string;
};

export type Series = {
  slug: string;
  title: string;
  logline: string;
  description: string;
  language: string;
  genres: string[];
  creatorName: string;
  coverAlt: string;
  // For SEO: stable image URL per series (replace with real covers later)
  coverUrl: string;
  updatedAt: string; // ISO
  episodes: Episode[];
};

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const seriesIndex: Series[] = [
  {
    slug: "midnight-canal",
    title: "Midnight Canal",
    logline:
      "A Maastricht student discovers a hidden canal that rewinds time—at a cost.",
    description:
      "Vertical webtoon series blending mystery, romance, and folklore. New episodes weekly. Read free episodes or unlock early access via credits.",
    language: "en",
    genres: ["Mystery", "Romance", "Urban Fantasy"],
    creatorName: "Studio Lumen",
    coverAlt: "A moonlit canal with glowing water and a silhouetted figure.",
    coverUrl: "/og?series=midnight-canal",
    updatedAt: iso(now),
    episodes: [
      {
        ep: 1,
        title: "The Ripple",
        isFree: true,
        publishedAt: "2026-01-10T08:00:00.000Z",
        excerpt:
          "A strange ripple appears under the bridge—then the city shifts by one day.",
      },
      {
        ep: 2,
        title: "Borrowed Hours",
        isFree: true,
        publishedAt: "2026-01-17T08:00:00.000Z",
        excerpt:
          "She learns the canal can rewind time, but every rewind steals something else.",
      },
      {
        ep: 3,
        title: "Fast Pass: The Price",
        isFree: false,
        publishedAt: "2026-01-24T08:00:00.000Z",
        excerpt:
          "Early access episode. The first real cost is paid—by someone who didn’t consent.",
      },
    ],
  },
  {
    slug: "paper-crown",
    title: "Paper Crown",
    logline:
      "A young illustrator fakes royal portraits—until the royal family hires her.",
    description:
      "A cozy, comedic serialized story for readers who love art, ambition, and slow-burn romance.",
    language: "en",
    genres: ["Slice of Life", "Comedy", "Romance"],
    creatorName: "Mira V.",
    coverAlt: "An illustrated crown made of folded paper on a desk.",
    coverUrl: "/og?series=paper-crown",
    updatedAt: iso(now),
    episodes: [
      {
        ep: 1,
        title: "The Forgery",
        isFree: true,
        publishedAt: "2026-01-05T08:00:00.000Z",
        excerpt:
          "A harmless commission turns into an accidental masterpiece—and an invitation.",
      },
      {
        ep: 2,
        title: "A Very Real Contract",
        isFree: false,
        publishedAt: "2026-01-12T08:00:00.000Z",
        excerpt:
          "Fast Pass episode. The palace wants her work… and her silence.",
      },
    ],
  },
];

export function getAllSeries() {
  return seriesIndex.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getSeriesBySlug(slug: string) {
  return seriesIndex.find((s) => s.slug === slug) || null;
}

export function getEpisode(series: Series, ep: number) {
  return series.episodes.find((e) => e.ep === ep) || null;
}
