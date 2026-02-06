// lib/data.ts
export type Episode = {
  ep: number;
  title: string;
  date: string; // ISO or yyyy-mm-dd
  isFree: boolean;
  blurb?: string;
};

export type Series = {
  slug: string;
  title: string;
  description: string;
  genres: string[];
  language: string;
  author: string;
  cover?: string; // optional image url/path
  episodes: Episode[];
};

const SERIES: Series[] = [
  {
    slug: "paper-crown",
    title: "Paper Crown",
    description:
      "A young illustrator fakes royal portraits—until the royal family hires her.",
    genres: ["Slice of Life", "Comedy", "Romance"],
    language: "EN",
    author: "Mira V.",
    episodes: [
      {
        ep: 1,
        title: "Episode 1: The Forgery",
        date: "2026-01-05",
        isFree: true,
        blurb:
          "A harmless commission turns into an accidental masterpiece—and an invitation.",
      },
      {
        ep: 2,
        title: "Episode 2: A Very Real Contract",
        date: "2026-01-12",
        isFree: false,
        blurb: "Fast Pass episode. The palace wants her work… and her silence.",
      },
    ],
  },
  {
    slug: "midnight-canal",
    title: "Midnight Canal",
    description:
      "A Maastricht student discovers a hidden canal that rewinds time—at a cost.",
    genres: ["Mystery", "Romance", "Urban Fantasy"],
    language: "EN",
    author: "Studio Lumen",
    episodes: [
      {
        ep: 1,
        title: "Episode 1: Water That Remembers",
        date: "2026-01-06",
        isFree: true,
        blurb: "A late-night shortcut becomes a door to yesterday.",
      },
      {
        ep: 2,
        title: "Episode 2: The Invoice",
        date: "2026-01-13",
        isFree: false,
        blurb: "Fast Pass episode. Time always sends a bill.",
      },
    ],
  },
];

export function getAllSeries(): Series[] {
  return SERIES;
}

export function getSeriesBySlug(slug: string): Series | undefined {
  return SERIES.find((s) => s.slug === slug);
}

export function getEpisode(seriesSlug: string, ep: number): Episode | undefined {
  const s = getSeriesBySlug(seriesSlug);
  return s?.episodes.find((e) => e.ep === ep);
}
