export type LockState =
  | "free"
  | "progress_locked"
  | "cliffhanger_locked"
  | "arc_locked"
  | "bonus_locked"
  | "spoiler_risk"
  | "streak_break_risk";

export type ArcKey = "arc1" | "arc2" | "arc3" | "arc4" | "arc5";

export type ArcDefinition = {
  key: ArcKey;
  label: string;
  startEp: number;
  endEp: number;
  tensionHook: string;
};

export type ReaderProgressState = {
  reading_streak: number;
  active_arc: ArcKey;
  arc_completion_percent: number;
  last_unlock_time: string;
  continuity_bonus: string;
  spoiler_risk_score: number;
  bonus_available: boolean;
};

export type Episode = {
  ep: number;
  title: string;
  publishedAt: string;
  isFree: boolean;
  fastPass: boolean;
  readingTime: number;
  excerpt: string;
  content: string;
  lockState?: LockState;
  cliffhangerType?: "emotional_reveal" | "character_betrayal" | "plot_twist" | "discovery_moment";
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
