import type { Episode, Series } from "@/lib/types";
import { getGeneratedSeries } from "@/lib/generatedStore";

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
        content:
          "The water didn’t move like a canal should. It held its breath, then rippled as if something underneath had blinked. Livia leaned on the bridge, the city quieting around her, and watched Maastricht rewind a single day in the space of a heartbeat. The alley lamps flickered. The same cyclist passed again. The same laugh echoed twice. The canal asked for a price, and she didn’t yet know what it would take.",
      },
      {
        ep: 2,
        title: "Borrowed Hours",
        isFree: true,
        publishedAt: "2026-01-17T08:00:00.000Z",
        excerpt:
          "She learns the canal can rewind time, but every rewind steals something else.",
        content:
          "She counted the seconds as the current flowed backward. Her memories stayed, but the city blurred at the edges. She lost a photograph. She lost a friend’s name. The canal kept its receipts in invisible ink, and Livia knew she’d have to pay in hours, in pieces, in something that couldn’t be replaced.",
      },
      {
        ep: 3,
        title: "Fast Pass: The Price",
        isFree: false,
        publishedAt: "2026-01-24T08:00:00.000Z",
        excerpt:
          "Early access episode. The first real cost is paid—by someone who didn’t consent.",
        content:
          "She asked for one last rewind. The canal answered, but not gently. When the morning arrived, it was her neighbor’s birthday and no one remembered. The cost had been transferred. The city kept its beauty. The canal kept its secret. Livia kept the guilt.",
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
        content:
          "She sketched the crown with a flourish of graphite, expecting a polite rejection. Instead, the palace courier returned two days later with a sealed envelope and a contract. Iris thought it was a joke. It wasn’t. The forged portrait had become the royal family’s new favorite.",
      },
      {
        ep: 2,
        title: "A Very Real Contract",
        isFree: false,
        publishedAt: "2026-01-12T08:00:00.000Z",
        excerpt:
          "Fast Pass episode. The palace wants her work… and her silence.",
        content:
          "The contract wasn’t about art. It was about discretion. Iris signed anyway, because the palace’s studio was the only room she’d ever seen painted in gold.",
      },
    ],
  },
];

export async function getAllSeries(): Promise<Series[]> {
  const generated = await getGeneratedSeries();
  const merged = [...generated, ...seriesIndex];
  return merged
    .slice()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const generated = await getGeneratedSeries();
  return generated.find((s) => s.slug === slug) || seriesIndex.find((s) => s.slug === slug) || null;
}

export function getEpisode(series: Series, ep: number): Episode | null {
  return series.episodes.find((e) => e.ep === ep) || null;
}
