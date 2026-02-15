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
  ratingBeta: number;
  readsBeta: number;
  likesBeta: number;
};

export type Series = {
  slug: string;
  title: string;
  hook: string;
  creatorName: string;
  language: string;
  genres: string[];
  tags: string[];
  description: string;
  longDescription: string;
  updatedAt: string;
  coverUrl: string;
  coverAlt: string;
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
  | "dutch"
  | "french"
  | "german";

export type GeneratedSeriesPayload = {
  series: Series;
  outline?: {
    title: string;
    summary: string;
  }[];
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
