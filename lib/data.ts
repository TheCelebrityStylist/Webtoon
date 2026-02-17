import { getGeneratedSeries } from "@/lib/generatedStore";
import { loadEpisodeMarkdown, markdownToSafeText } from "@/lib/markdown";
import { coverExists, coverPublicUrl, generateCoverImage } from "@/lib/coverGenerator";
import type { CollectionKey, Episode, Series } from "@/lib/types";

const DAY = 86_400_000;
const now = Date.now();

type Seed = [slug: string, title: string, creatorName: string, language: string, genres: [string, string]];

const seeds: Seed[] = [
  ["midnight-canal", "Midnight Canal", "Livia Brandt", "nl", ["Mystery", "Thriller"]],
  ["paper-crown", "Paper Crown", "Mira Vale", "fr", ["Drama", "Romance"]],
  ["glass-harbor", "Glass Harbor", "Noor Atelier", "en", ["Sci-Fi", "Drama"]],
  ["aurora-market", "Aurora Market", "Northline Stories", "de", ["Fantasy", "Slice of Life"]],
  ["vinyl-hearts", "Vinyl Hearts", "Kai Morgen", "en", ["Romance", "Drama"]],
  ["signal-bridge", "Signal Bridge", "Rafa Costa", "pt", ["Mystery", "Drama"]],
  ["night-bakery", "Night Bakery", "Emma Rossi", "it", ["Slice of Life", "Romance"]],
  ["afterlight", "Afterlight", "Theo Marin", "en", ["Sci-Fi", "Thriller"]],
];

const flagshipEpisodes: Record<string, Array<{ ep: number; title: string; excerpt: string; isFree: boolean }>> = {
  "midnight-canal": [
    { ep: 1, title: "Toll at 23:58", excerpt: "A city rewinds one night. Livia learns every reset takes a life-cost.", isFree: true },
    { ep: 2, title: "The Bell That Rings Backward", excerpt: "A witness disappears from records while the canal keeps a second clock.", isFree: true },
    { ep: 3, title: "Border Ledger", excerpt: "NL-BE customs logs reveal who profits each time the night loops.", isFree: false },
    { ep: 4, title: "Borrowed Tomorrow", excerpt: "Livia trades a memory to keep one person alive past midnight.", isFree: false },
    { ep: 5, title: "Tide of Names", excerpt: "The city starts forgetting children first. Livia chooses whom to save.", isFree: false },
    { ep: 6, title: "The Last Crossing", excerpt: "At the lock gate, the truth demands one irreversible surrender.", isFree: false },
  ],
  "paper-crown": [
    { ep: 1, title: "The Sitter Never Blinked", excerpt: "A portrait commission opens a royal fraud chain inside a modern court.", isFree: true },
    { ep: 2, title: "Gold Leaf Alibi", excerpt: "Iris paints over a threat hidden in ceremonial symbolism.", isFree: true },
    { ep: 3, title: "Archive of Quiet Treason", excerpt: "A stolen sketchbook proves succession narratives were curated, not inherited.", isFree: false },
    { ep: 4, title: "Varnish and Bloodline", excerpt: "A gala reveal turns into a legal trap staged by rival households.", isFree: false },
    { ep: 5, title: "Court of Mirrors", excerpt: "Everyone gets what they wanted except the person who started the game.", isFree: false },
    { ep: 6, title: "Crown in Solvent", excerpt: "The final portrait reveals the one heir no one can publicly claim.", isFree: false },
  ],
};

function fallbackEpisodeBody(title: string, ep: number): string {
  return `${title} episode ${ep} opens with a concrete decision under public pressure.

The lead misreads one ally, then recovers with a costly counter-move.

By the final beat, the chapter forces a question that cannot be postponed.`;
}

function loadEpisodeBody(slug: string, ep: number, title: string): string {
  const md = loadEpisodeMarkdown(slug, ep);
  if (!md) return fallbackEpisodeBody(title, ep);
  return markdownToSafeText(md);
}

function genericEpisodeTitle(ep: number) {
  const map: Record<number, string> = {
    1: "Pilot",
    2: "Pressure Line",
    3: "Countermove",
    4: "Quiet Cost",
    5: "Threshold",
    6: "Faultline",
  };
  return map[ep] ?? `Episode ${ep}`;
}

function buildEpisodes(seed: Seed, index: number): Episode[] {
  const [slug, title] = seed;
  const flagship = flagshipEpisodes[slug];
  const total = flagship ? 6 : 8;

  return Array.from({ length: total }, (_, i) => {
    const ep = i + 1;
    const body = loadEpisodeBody(slug, ep, title);
    const custom = flagship?.find((item) => item.ep === ep);
    const isFree = custom?.isFree ?? ep <= 2;

    return {
      ep,
      title: custom?.title ?? genericEpisodeTitle(ep),
      publishedAt: new Date(now - (index * 6 + ep) * DAY).toISOString(),
      isFree,
      fastPass: !isFree,
      readingTime: Math.max(4, Math.round(body.split(/\s+/).length / 210)),
      excerpt: custom?.excerpt ?? `${title} episode ${ep} accelerates stakes and closes on a forced decision.`,
      content: body,
    };
  });
}

function createLongDescription(slug: string, title: string): string {
  if (slug === "midnight-canal") {
    return "A Maastricht border-noir time-loop serial where each reset steals memory, luck, or identity. Midnight Canal blends civic conspiracy, intimate grief, and escalating moral cost in a city that literally charges interest on tomorrow.";
  }
  if (slug === "paper-crown") {
    return "A European court-intrigue thriller set inside modern ceremonial monarchy, where portraits are legal weapons and lineage is a negotiable narrative. Paper Crown fuses romance tension, class performance, and institutional deceit.";
  }

  return `${title} is designed for vertical binge reading with clear stakes, clean pacing, and high-retention cliffhangers.`;
}

export const seriesIndex: Series[] = seeds.map((seed, index) => {
  const [slug, title, creatorName, language, genres] = seed;
  const episodes = buildEpisodes(seed, index);

  return {
    slug,
    title,
    hook:
      slug === "midnight-canal"
        ? "Every time the night rewinds, someone in Maastricht wakes up erased."
        : slug === "paper-crown"
          ? "One portrait can crown a future—or bury a bloodline."
          : `${title} turns one difficult decision into weekly compulsion.`,
    creatorName,
    language,
    genres,
    tags: ["Vertical", "European originals", "Cliffhanger arcs", "Creator-backed drops"],
    description:
      slug === "midnight-canal"
        ? "Border noir meets time-loop debt in a premium Dutch-Belgian thriller."
        : slug === "paper-crown"
          ? "Royal portrait fraud, social climbing, and court intrigue in modern Europe."
          : `${title} is a premium vertical serial with free entry and paid momentum.`,
    longDescription: createLongDescription(slug, title),
    updatedAt: episodes[episodes.length - 1]?.publishedAt ?? new Date(now - index * DAY).toISOString(),
    coverUrl: coverExists(slug) ? coverPublicUrl(slug) : `/covers/${slug}.svg`,
    coverAlt: `${title} cover art`,
    stats: {
      ratingBeta: Number((4.3 + (index % 5) * 0.1).toFixed(2)),
      readsBeta: 2200 + index * 420,
      likesBeta: 460 + index * 110,
    },
    episodes,
  };
});

export const series: Series[] = seriesIndex;

export const collections: Record<CollectionKey, string[]> = {
  trending: seriesIndex.map((s) => s.slug),
  newThisWeek: seriesIndex.slice(0, 6).map((s) => s.slug),
  staffPicks: ["midnight-canal", "paper-crown", "glass-harbor", "aurora-market", "vinyl-hearts", "signal-bridge"],
  under10: seriesIndex.filter((s) => s.episodes[0].readingTime <= 10).map((s) => s.slug),
  romance: seriesIndex.filter((s) => s.genres.includes("Romance")).map((s) => s.slug),
  mystery: seriesIndex.filter((s) => s.genres.includes("Mystery")).map((s) => s.slug),
  fantasy: seriesIndex.filter((s) => s.genres.includes("Fantasy")).map((s) => s.slug),
  sliceOfLife: seriesIndex.filter((s) => s.genres.includes("Slice of Life")).map((s) => s.slug),
  dutch: seriesIndex.filter((s) => s.language === "nl").map((s) => s.slug),
  french: seriesIndex.filter((s) => s.language === "fr").map((s) => s.slug),
  german: seriesIndex.filter((s) => s.language === "de").map((s) => s.slug),
};


async function ensureMissingCovers(items: Series[]): Promise<void> {
  if (!process.env.OPENAI_API_KEY) return;

  await Promise.all(
    items.map(async (item) => {
      if (coverExists(item.slug)) return;
      try {
        await generateCoverImage({
          title: item.title,
          genre: item.genres.join(", "),
          tone: item.tags[0] ?? "Cinematic",
          setting: item.longDescription.slice(0, 140),
          tagline: item.hook,
          slug: item.slug,
        });
      } catch {
        // no-op in MVP fallback mode
      }
    }),
  );
}
function sortByUpdated(a: Series, b: Series) {
  return a.updatedAt < b.updatedAt ? 1 : -1;
}

export async function getAllSeries(): Promise<Series[]> {
  const generated = await getGeneratedSeries();
  const merged = [...generated, ...seriesIndex].sort(sortByUpdated);
  await ensureMissingCovers(merged);
  return merged.map((item) => ({ ...item, coverUrl: coverExists(item.slug) ? coverPublicUrl(item.slug) : item.coverUrl }));
}

export async function getSeries(slug: string): Promise<Series | null> {
  const all = await getAllSeries();
  return all.find((item) => item.slug === slug) ?? null;
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  return getSeries(slug);
}

export async function getEpisode(seriesSlug: string, ep: number): Promise<Episode | null> {
  const entry = await getSeries(seriesSlug);
  if (!entry) return null;
  return entry.episodes.find((episode) => episode.ep === ep) ?? null;
}

export async function getCollectionSeries(key: CollectionKey, limit?: number): Promise<Series[]> {
  const all = await getAllSeries();
  const ordered = collections[key].map((slug) => all.find((item) => item.slug === slug)).filter(Boolean) as Series[];
  return typeof limit === "number" ? ordered.slice(0, limit) : ordered;
}

export async function getAllEpisodeRoutes(): Promise<Array<{ slug: string; ep: number; updatedAt: string; isFree: boolean }>> {
  const all = await getAllSeries();
  return all.flatMap((item) =>
    item.episodes.map((ep) => ({
      slug: item.slug,
      ep: ep.ep,
      updatedAt: ep.publishedAt,
      isFree: ep.isFree,
    })),
  );
}
