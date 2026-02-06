export type Episode = {
  ep: number;
  title: string;
  isFree: boolean;
  publishedAt: string; // ISO
  excerpt: string;
  content?: string;
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
  coverUrl: string;
  updatedAt: string; // ISO
  episodes: Episode[];
};

export type GeneratedSeriesPayload = {
  series: Series;
  outline?: {
    title: string;
    summary: string;
  }[];
};
