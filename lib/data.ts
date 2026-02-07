// lib/data.ts
export type Episode = {
  ep: number;
  title: string;
  blurb: string;
  dateISO: string; // YYYY-MM-DD
  kind: "free" | "fastpass";
  // Optional: fully-fledged episode content (can be long)
  content?: string;
};

export type Series = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  language: string; // e.g. "EN"
  author: string;
  cover: {
    // keep it simple: gradient placeholder or image path
    kind: "gradient" | "image";
    value: string; // gradient CSS or /public path like "/covers/paper-crown.jpg"
  };
  episodes: Episode[];
};

const SERIES: Series[] = [
  {
    slug: "paper-crown",
    title: "Paper Crown",
    tagline: "A young illustrator fakes royal portraits—until the palace hires her.",
    description:
      "A cozy, comedic serialized story for readers who love art, ambition, and slow-burn romance.",
    tags: ["Slice of Life", "Comedy", "Romance"],
    language: "EN",
    author: "Mira V.",
    cover: {
      kind: "gradient",
      value:
        "linear-gradient(135deg, rgba(17,24,39,.55), rgba(99,102,241,.85))",
    },
    episodes: [
      {
        ep: 1,
        title: "The Forgery",
        blurb:
          "A harmless commission turns into an accidental masterpiece—and an invitation.",
        dateISO: "2026-01-05",
        kind: "free",
        content:
          "She told herself it was just practice...\n\n(Replace this with your real episode text.)",
      },
      {
        ep: 2,
        title: "A Very Real Contract",
        blurb: "Fast Pass episode. The palace wants her work… and her silence.",
        dateISO: "2026-01-12",
        kind: "fastpass",
        content:
          "The envelope had no crest—only weight...\n\n(Replace this with your real episode text.)",
      },
    ],
  },
  {
    slug: "midnight-canal",
    title: "Midnight Canal",
    tagline: "A Maastricht student finds a hidden canal that rewinds time—at a cost.",
    description:
      "Mystery meets romance in an urban fantasy where every rewind steals something back.",
    tags: ["Mystery", "Romance", "Urban Fantasy"],
    language: "EN",
    author: "Studio Lumen",
    cover: {
      kind: "gradient",
      value:
        "linear-gradient(135deg, rgba(31,41,55,.55), rgba(79,70,229,.85))",
    },
    episodes: [
      {
        ep: 1,
        title: "Water Under Stone",
        blurb: "A locked grate. A humming current. A second chance nobody asked for.",
        dateISO: "2026-01-06",
        kind: "free",
        content:
          "At midnight, the city sounds different...\n\n(Replace this with your real episode text.)",
      },
      {
        ep: 2,
        title: "The Price of Rewind",
        blurb: "Fast Pass episode. The canal gives. The canal takes.",
        dateISO: "2026-01-13",
        kind: "fastpass",
        content:
          "The first rewind felt like relief...\n\n(Replace this with your real episode text.)",
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
