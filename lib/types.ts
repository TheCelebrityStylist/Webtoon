export type Episode = {
  ep: number;
  title: string;
  publishedAt: string;
  isFree: boolean;
  fastPass: boolean;
  readingTime: number;
  excerpt: string;
  content: string;
};

export type SeriesStats = {
  betaReads: number;
  betaRating: number;
};

export type Series = {
  slug: string;
  title: string;
  logline: string;
  description: string;
  longDescription: string;
  language: string;
  genres: string[];
  tags: string[];
  creatorName: string;
  coverAlt: string;
  coverUrl: string;
  updatedAt: string;
  contentWarnings?: string[];
  stats: SeriesStats;
  episodes: Episode[];
};

export type CollectionKey =
  | "trending"
  | "newThisWeek"
  | "staffPicks"
  | "under10"
  | "romance"
  | "mystery"
  | "fantasy"
  | "sliceOfLife"
  | "dutchSpotlight"
  | "frenchSpotlight"
  | "germanSpotlight";

export type GeneratedSeriesPayload = {
  series: Series;
  outline?: { title: string; summary: string }[];
  storyBible?: {
    themes: string[];
    characterArcs: string[];
    worldRules: string[];
    marketingCopy: {
      blurb: string;
      trailerText: string;
      tags: string[];
    };
  };
};
