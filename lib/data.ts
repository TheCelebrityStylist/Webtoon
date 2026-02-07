// lib/data.ts

export type Episode = {
  ep: number;
  title: string;
  date: string; // ISO-ish string is fine for MVP
  kind: "free" | "fastpass";
  contentHtml: string;
};

export type Series = {
  slug: string;
  title: string;
  tagline: string;
  synopsis: string;
  tags: string[];
  language: string;
  author: string;
  cover: { bgFrom: string; bgTo: string };
  episodes: Episode[];
};

const SERIES: Series[] = [
  {
    slug: "paper-crown",
    title: "Paper Crown",
    tagline: "A young illustrator fakes royal portraits—until the royal family hires her.",
    synopsis:
      "A cozy, comedic serialized story for readers who love art, ambition, and slow-burn romance.",
    tags: ["Slice of Life", "Comedy", "Romance"],
    language: "EN",
    author: "Mira V.",
    cover: { bgFrom: "#6b7280", bgTo: "#4f46e5" },
    episodes: [
      {
        ep: 1,
        title: "The Forgery",
        date: "2026-01-05",
        kind: "free",
        contentHtml:
          "<p>Episode content placeholder. Replace with real panels/story text.</p>",
      },
      {
        ep: 2,
        title: "A Very Real Contract",
        date: "2026-01-12",
        kind: "fastpass",
        contentHtml:
          "<p>Fast Pass episode placeholder. Replace with real panels/story text.</p>",
      },
    ],
  },
  {
    slug: "midnight-canal",
    title: "Midnight Canal",
    tagline: "A Maastricht student discovers a hidden canal that rewinds time—at a cost.",
    synopsis:
      "Mystery, romance, and urban fantasy collide as every rewind demands something back.",
    tags: ["Mystery", "Romance", "Urban Fantasy"],
    language: "EN",
    author: "Studio Lumen",
    cover: { bgFrom: "#6b7280", bgTo: "#4f46e5" },
    episodes: [
      {
        ep: 1,
        title: "The Waterline",
        date: "2026-01-06",
        kind: "free",
        contentHtml:
          "<p>Episode content placeholder. Replace with real panels/story text.</p>",
      },
      {
        ep: 2,
        title: "Borrowed Minutes",
        date: "2026-01-13",
        kind: "fastpass",
        contentHtml:
          "<p>Fast Pass episode placeholder. Replace with real panels/story text.</p>",
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

export function getEpisode(seriesSlug: string, ep: number): Episode | null {
  const s = getSeriesBySlug(seriesSlug);
  if (!s) return null;
  return s.episodes.find((e) => e.ep === ep) ?? null;
}

