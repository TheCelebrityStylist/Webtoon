// lib/data.ts
export type Episode = {
  ep: number;
  title: string;
  blurb: string;
  dateISO: string; // "2026-01-05"
  isFree: boolean;
};

export type Series = {
  slug: string;
  title: string;
  logline: string;
  description: string;
  creatorName: string;
  language: string; // "en", "nl", etc
  genres: string[];
  cover?: string; // optional image path
  episodes: Episode[];
};

const SERIES: Series[] = [
  {
    slug: "paper-crown",
    title: "Paper Crown",
    logline: "A young illustrator fakes royal portraits—until the royal family hires her.",
    description:
      "A cozy, comedic serialized story for readers who love art, ambition, and slow-burn romance.",
    creatorName: "Mira V.",
    language: "en",
    genres: ["Slice of Life", "Comedy", "Romance"],
    episodes: [
      {
        ep: 1,
        title: "The Forgery",
        blurb: "A harmless commission turns into an accidental masterpiece—and an invitation.",
        dateISO: "2026-01-05",
        isFree: true,
      },
      {
        ep: 2,
        title: "A Very Real Contract",
        blurb: "Fast Pass episode. The palace wants her work… and her silence.",
        dateISO: "2026-01-12",
        isFree: false,
      },
    ],
  },
  {
    slug: "midnight-canal",
    title: "Midnight Canal",
    logline: "A Maastricht student discovers a hidden canal that rewinds time—at a cost.",
    description:
      "Mystery + romance with urban fantasy twists, set in a city that keeps secrets in plain sight.",
    creatorName: "Studio Lumen",
    language: "en",
    genres: ["Mystery", "Romance", "Urban Fantasy"],
    episodes: [
      {
        ep: 1,
        title: "Under the Bridge",
        blurb: "She follows the ripple—and the city answers back.",
        dateISO: "2026-01-06",
        isFree: true,
      },
      {
        ep: 2,
        title: "The Second Minute",
        blurb: "Fast Pass episode. Time gives, then takes.",
        dateISO: "2026-01-13",
        isFree: false,
      },
    ],
  },
];

export function getAllSeries(): Series[] {
  return SERIES;
}

export function getSeriesBySlug(slug: string): Series | null {
  return SERIES.find((s) => s.slug === slug) ?? null;
}

export function getEpisode(series: Series, ep: number): Episode | null {
  return series.episodes.find((e) => e.ep === ep) ?? null;
}
