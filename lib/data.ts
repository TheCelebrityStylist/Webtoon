import type { Episode, Series } from "@/lib/types";
import { getGeneratedSeries } from "@/lib/generatedStore";

const now = new Date();
const iso = (d: Date) => d.toISOString();

const midnightEpisode1 = `The water didn’t move like a canal should. It held its breath, then rippled as if something underneath had blinked. Livia leaned on the bridge, the city quieting around her, and watched Maastricht rewind a single day in the space of a heartbeat.

The alley lamps flickered. The same cyclist passed again. The same laugh echoed twice. Livia’s phone buzzed with yesterday’s notifications, and her stomach sank at the sight of a message she had already answered.

She walked the canal’s edge, counting the steps between lampposts, the same steps she’d taken yesterday, the same steps she’d take tomorrow. The canal watched her back. Every ripple seemed to ask a question: what would you change if time bent for you?

She told herself it was a trick of light. She told herself there were sensible explanations. But the city felt too precise, too rehearsed, like a play she had already seen.

On the bridge, a figure in a deep green coat stood with their hands in their pockets. They looked up as if they knew her name. The canal rippled again, and the world held its breath.

Livia whispered, “No one rewinds for free.” The canal answered with a gentle, unstoppable tug.`;

const midnightEpisode2 = `The second time the canal reversed the day, Livia felt the loss like a missing tooth. A photo in her gallery had become a blank gray square. Her favorite song had been replaced by silence, the file still there but the music gone.

She watched the current moving backward, a clean defiance of every rule she knew. Her friends remembered the day differently, as if they were reading from a script that had been edited.

Livia wrote everything down: the color of the clouds, the time the bakery opened, the sound of a street musician who always missed the same note. The notes stayed. The city did not.

By nightfall, a small circle of candles flickered along the canal. The green-coat figure returned with a warning and a rumor: the canal kept receipts. It took something each time it gave.

Livia’s pen paused over the page. She had already decided she would pay, because curiosity had always been her sharpest hunger.

She asked for one more rewind. The canal answered with a silence that felt like a grin.`;

const midnightEpisode3 = `She wanted to fix a mistake she hadn’t made yet. The canal obliged, but not gently. When the morning arrived, it was her neighbor’s birthday and no one remembered. The cost had been transferred.

The day repeated itself perfectly. The same cyclist, the same bakery, the same laugh. Yet the air tasted different, as if the city had begun to keep its own secrets.

Livia found the neighbor in the stairwell, candles unlit, smile uncertain. She realized what she had stolen. The canal didn’t take from her directly—it took from the world around her.

She ran to the bridge, hands trembling, and pressed her palms against the cold railing. “I’ll pay you back,” she said, unsure if canals could forgive.

The green-coat figure appeared again, eyes soft with something close to pity. “You can’t pay with guilt,” they said. “Only with time.”

Night fell. The canal shimmered. Livia stood at the edge, knowing the next choice would be the one she couldn’t rewind.`;

const paperEpisode1 = `Iris had forged a portrait for a client who couldn’t afford an original. It was supposed to be a harmless favor, a quick sketch on paper so thin it almost apologized for existing.

Instead, the portrait traveled. It passed through hands she would never meet, arrived at a palace she had never seen, and landed on a desk lined with gold.

The letter arrived two days later. It asked her to come and bring her pencils. She laughed out loud, then read the seal again and realized it wasn’t a joke.

The palace studio smelled of varnish and old stories. A silk curtain held back the light and the prince held a teacup he didn’t sip.

“You made my grandmother look brave,” he said. “That’s the portrait we want the world to see.”

Iris sat down, hands shaking, and agreed. She had always wanted to paint a crown. She just didn’t think it would be real.`;

const paperEpisode2 = `The contract wasn’t about art. It was about discretion. Iris signed anyway, because the palace’s studio was the only room she’d ever seen painted in gold.

The first commission was a formal portrait, but the second was a request for something softer: the royal family at dinner, laughing, without guards in the frame.

She sketched the prince’s smile, the queen’s quiet patience, and the way the palace staff hovered like a constellation around them. It felt like painting a story, not a face.

In the hallway, a maid slipped Iris a note. It said, “They want you because you don’t know the rules.”

Iris folded it into her pocket, heart pounding, and picked up her charcoal. She’d spent her whole life breaking rules. She didn’t realize she was about to become one.`;

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
        content: midnightEpisode1,
      },
      {
        ep: 2,
        title: "Borrowed Hours",
        isFree: true,
        publishedAt: "2026-01-17T08:00:00.000Z",
        excerpt:
          "She learns the canal can rewind time, but every rewind steals something else.",
        content: midnightEpisode2,
      },
      {
        ep: 3,
        title: "Fast Pass: The Price",
        isFree: false,
        publishedAt: "2026-01-24T08:00:00.000Z",
        excerpt:
          "Early access episode. The first real cost is paid—by someone who didn’t consent.",
        content: midnightEpisode3,
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
        content: paperEpisode1,
      },
      {
        ep: 2,
        title: "A Very Real Contract",
        isFree: false,
        publishedAt: "2026-01-12T08:00:00.000Z",
        excerpt:
          "Fast Pass episode. The palace wants her work… and her silence.",
        content: paperEpisode2,
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
