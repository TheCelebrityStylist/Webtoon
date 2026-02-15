import { getGeneratedSeries } from "@/lib/generatedStore";
import type { CollectionKey, Episode, Series } from "@/lib/types";

const DAY = 86_400_000;
const now = Date.now();

const longBodyOne = `At 23:58, Livia watched the Maastricht canal hold its breath.

Water should move with indifference. This water moved with intent.

The first sign was small: a cyclist with a yellow scarf passed her twice from the same direction within thirty seconds. Same bell. Same apology. Same glance that did not register she existed.

The second sign was bureaucratic and impossible. Her phone buzzed with a message she had answered yesterday, now marked unread. The time stamp had changed. The punctuation had changed. Her own response had vanished.

By midnight, church bells struck, then struck again half a tone lower. Streetlights blinked in sequence, backward, then normal. A tram at the far junction paused and rolled in reverse before continuing forward like nothing had happened.

Livia walked the quay counting house numbers because counting was a tool against panic. Number 14 had petunias this morning; tonight, only wet soil. A bakery chalkboard menu reverted to Monday soup. Her notes app now held a lecture she never attended.

On the stone steps sat a woman in a green coat with Livia's posture and someone else's patience.

"You noticed," the woman said.

"Noticed what?"

"The city borrowing a day."

Livia should have run. Instead she crouched and held her hand over the canal. Her reflection lagged behind her fingers by half a second, then shifted: older face, scar above the lip, eyes with the exhausted precision of someone who had learned to regret efficiently.

"Every rewind has a receipt," the woman said. "Memory. Luck. Somebody else's normal happiness."

"I didn't ask for this."

"No one does on night one."

Across the water, all three church towers chimed at once though no clocks marked the hour.

Livia whispered, "What if I only need one more chance?"

The canal answered with concentric rings that climbed stone like frost.

The woman stood and stepped into the light. She wore Livia's face ten years older.

"Then choose carefully," she said. "Tomorrow, someone forgets your name."`;

const longBodyTwo = `Iris painted for rent money and quiet.

The rent came. The quiet did not.

A sealed envelope arrived in her Rotterdam studio with a royal crest and a handwritten note: *Your portrait made her look brave. Ours made her look obedient. We prefer brave. Be at Noordhaven Palace at 09:00. Bring brushes.*

At 08:42, a black car waited outside her building with diplomatic plates and no explanation.

The palace studio was immaculate and emotionally sterile: perfect perspective, flawless skin tones, no pulse. Adrian, the procurement lead with paint on one cuff, said he wanted a new portrait cycle before spring diplomatic week.

"We need honesty that still photographs well," he said.

"Honesty rarely photographs well," Iris answered.

She signed anyway because one clause stood out from all the legal armor: *Artist retains moral rights and original studies.*

Week one was formal. Week two was personal. Week three was political.

A communications advisor circled her draft in red and said, "The hand posture reads defensive. Make him inevitable."

"He's not inevitable," Iris said. "He's human."

Adrian entered, saw the markup, and told the advisor to leave the painting untouched.

That night a maid slipped Iris a folded note in the stairwell: *If they ask you to flatten us, paint us sharper.*

Later she found an archived canvas hidden behind muslin: the royal grandmother leading a rain-soaked workers' protest with a megaphone and a grin. Official history had quietly removed it.

The next morning Adrian arrived with a split lip and no story. "Tomorrow I announce an open creator fund," he said softly. "They'll call it reckless. I need this portrait unveiled before the speech."

"Then we paint all night," Iris replied.

By dawn the portrait was finished. By 08:57 the press room was full. At 08:59 a security officer whispered in Adrian's ear and all color left his face.

He looked across the room to Iris and mouthed two words.

*They know.*`;

const longBodyThree = `Mara's access badge stopped opening doors at 10:04.

At 10:05 her landlord texted "urgent structural maintenance." At 10:06 an unknown number offered her a consulting contract worth triple her salary. At 10:07 she admitted this was no coincidence. It was pressure choreography.

The file on her phone began as a transport audit and ended as a map of municipal favors: rezoning signatures, emergency permits, delayed inspections, and one youth center closure hidden beneath a line item called *night safety optimization*.

Her mother's building appeared on page six.

Theo called from a stairwell. "You have action. You still need intent." 

"How long?" 

"Hours, if we burn favors."

Mara posted one verified fragment with calm context and strict evidence language. She turned on archive mode and disabled replies from new accounts.

Public reaction arrived in familiar waves: denial, outrage, opportunism, and late-night corroboration from people with too much to lose.

At 13:41 she was invited to a "constructive dialogue" in a glass room overlooking the river.

"Let's keep this practical," said the man in perfect tailoring.

"Practical for who?" Mara asked.

"For everyone."

"Everyone never means everyone."

He projected clean charts proving difficult trade-offs and unavoidable fiscal realities. Then he zoomed into one block and tapped her mother's address with a laser pointer.

"You're close to this," he said gently, weaponizing empathy.

Mara asked for water, stepped out, and used six seconds by the dispenser to trigger scheduled release to three journalists who disagreed on nearly everything except corruption.

At 17:58 Theo arrived with a bleeding knuckle and a thumb drive.

"I got intent audio," he said. "One shot."

Three precise knocks landed on the apartment door. Not loud. Not rushed. Professional.

The lock turned from the outside.`;

const longEpisodes = [longBodyOne, longBodyTwo, longBodyThree];

const seeds = [
  ["midnight-canal", "Midnight Canal", "Studio Lumen"],
  ["paper-crown", "Paper Crown", "Mira Vale"],
  ["glass-harbor", "Glass Harbor", "Noor Atelier"],
  ["olive-circuit", "Olive Circuit", "Helios Lab"],
  ["aurora-market", "Aurora Market", "Northline Stories"],
  ["vinyl-hearts", "Vinyl Hearts", "Kai Morgen"],
  ["tram-17", "Tram 17", "Lotte de Vries"],
  ["atlas-of-rain", "Atlas of Rain", "Ria Oeste"],
  ["neon-mosaic", "Neon Mosaic", "Atelier Delta"],
  ["quiet-fire", "Quiet Fire", "Celine Dubois"],
  ["winter-index", "Winter Index", "Aino K"],
  ["signal-bridge", "Signal Bridge", "Rafa Costa"],
  ["hollow-garden", "Hollow Garden", "Iris Kohn"],
  ["night-bakery", "Night Bakery", "Emma Rossi"],
  ["river-laws", "River Laws", "Pavel S"],
  ["copper-stars", "Copper Stars", "Ines Moreau"],
  ["slow-comet", "Slow Comet", "Greta Holm"],
  ["afterlight", "Afterlight", "Theo Marin"],
  ["silent-viaduct", "Silent Viaduct", "Jules Hart"],
  ["opal-signal", "Opal Signal", "Marta Bloom"],
  ["ember-ledger", "Ember Ledger", "Niko S"],
  ["northbound-diary", "Northbound Diary", "Elin V"],
  ["city-of-salt", "City of Salt", "Yara Ben"],
  ["borrowed-neon", "Borrowed Neon", "Luca P"],
] as const;

const languages = ["en", "fr", "de", "nl", "es", "it", "pt", "pl", "sv", "fi", "el", "cs"];
const genres = [
  ["Romance", "Drama"],
  ["Mystery", "Thriller"],
  ["Fantasy", "Slice of Life"],
  ["Sci-Fi", "Drama"],
] as const;

function createLongDescription(title: string, genreA: string, genreB: string): string {
  return `${title} is designed as a premium vertical serial for readers who want cinematic pacing without visual noise. The series combines ${genreA.toLowerCase()} tension with ${genreB.toLowerCase()} intimacy, then anchors each chapter in concrete emotional consequences. Instead of disposable cliffhangers, episodes end on decisions that reshape relationships, incentives, and trust.

The editorial intent is simple: keep every scroll meaningful. Scenes are written for one-handed reading rhythm, with clear beat transitions, high-legibility paragraphs, and hooks that reward completion. The tone balances urgency with clarity so readers can binge quickly without losing narrative nuance.

For creators and critics, ${title} also models the EU Webtoon promise: multilingual discovery, transparent free-versus-Fast-Pass signaling, and a creator-first release structure where premium unlocks support the work without forcing a subscription habit. In MVP, this means cleaner economics, clearer communication, and stronger retention loops. In practice, it means readers start free, feel momentum fast, and choose to continue because the story earns it.`;
}

function episodeTitle(ep: number): string {
  if (ep === 1) return "Pilot";
  if (ep === 2) return "Pressure Line";
  if (ep === 3) return "Countermove";
  if (ep === 4) return "Quiet Cost";
  if (ep === 5) return "Threshold";
  if (ep === 6) return "Faultline";
  if (ep === 7) return "Breakwater";
  return "Aftermath";
}

function makeEpisode(seriesTitle: string, seedIndex: number, ep: number): Episode {
  const free = ep <= 2;
  const longEligible = seedIndex < 8 && ep === 1;
  const base = longEligible
    ? longEpisodes[seedIndex % longEpisodes.length]
    : `${seriesTitle} episode ${ep} opens with a tactical decision that forces the lead into public risk.\n\nA trusted ally offers useful help with hidden terms.\n\nBy mid-episode the stakes escalate from personal discomfort to structural danger.\n\nThe final beat closes on an unresolved choice that naturally drives the next chapter.`;

  return {
    ep,
    title: episodeTitle(ep),
    publishedAt: new Date(now - (seedIndex * 4 + ep) * DAY).toISOString(),
    isFree: free,
    fastPass: !free,
    readingTime: Math.max(4, Math.round(base.split(" ").length / 210)),
    excerpt: `${seriesTitle} pushes the stakes forward in episode ${ep} with a sharp end hook.`,
    content: base,
  };
}

export const seriesIndex: Series[] = seeds.map((seed, index) => {
  const [slug, title, creatorName] = seed;
  const [genreA, genreB] = genres[index % genres.length];
  const language = languages[index % languages.length];

  return {
    slug,
    title,
    hook: `${title} turns one difficult decision into a weekly compulsion to keep scrolling.`,
    creatorName,
    language,
    genres: [genreA, genreB],
    tags: ["Vertical", "Weekly", "European originals", index % 2 === 0 ? "Character-led" : "High-stakes"],
    description: `${title} is a conversion-optimized vertical series blending ${genreA.toLowerCase()} and ${genreB.toLowerCase()} for binge-friendly momentum.`,
    longDescription: createLongDescription(title, genreA, genreB),
    updatedAt: new Date(now - index * 2 * DAY).toISOString(),
    coverUrl: `/covers/${slug}.svg`,
    coverAlt: `${title} cover art`,
    contentWarnings: index % 5 === 0 ? ["Mild language", "Emotional conflict"] : undefined,
    stats: {
      ratingBeta: Number((4.18 + (index % 7) * 0.09).toFixed(2)),
      readsBeta: 1400 + index * 310,
      likesBeta: 260 + index * 72,
    },
    episodes: Array.from({ length: 8 }, (_, i) => makeEpisode(title, index, i + 1)),
  };
});

export const series: Series[] = seriesIndex;

export const collections: Record<CollectionKey, string[]> = {
  trending: seriesIndex.slice(0, 12).map((s) => s.slug),
  newThisWeek: seriesIndex.slice(12, 18).map((s) => s.slug),
  staffPicks: ["paper-crown", "aurora-market", "vinyl-hearts", "atlas-of-rain", "night-bakery", "afterlight"],
  under10: seriesIndex.filter((s) => s.episodes[0].readingTime <= 10).slice(0, 12).map((s) => s.slug),
  romance: seriesIndex.filter((s) => s.genres.includes("Romance")).map((s) => s.slug),
  mystery: seriesIndex.filter((s) => s.genres.includes("Mystery")).map((s) => s.slug),
  fantasy: seriesIndex.filter((s) => s.genres.includes("Fantasy")).map((s) => s.slug),
  sliceOfLife: seriesIndex.filter((s) => s.genres.includes("Slice of Life")).map((s) => s.slug),
  dutch: seriesIndex.filter((s) => s.language === "nl").map((s) => s.slug),
  french: seriesIndex.filter((s) => s.language === "fr").map((s) => s.slug),
  german: seriesIndex.filter((s) => s.language === "de").map((s) => s.slug),
};

function sortByUpdated(a: Series, b: Series) {
  return a.updatedAt < b.updatedAt ? 1 : -1;
}

export async function getAllSeries(): Promise<Series[]> {
  const generated = await getGeneratedSeries();
  return [...generated, ...seriesIndex].sort(sortByUpdated);
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
  const ordered = collections[key]
    .map((slug) => all.find((item) => item.slug === slug))
    .filter(Boolean) as Series[];
  return typeof limit === "number" ? ordered.slice(0, limit) : ordered;
}

export async function getAllEpisodeRoutes(): Promise<Array<{ slug: string; ep: number; updatedAt: string; isFree: boolean }>> {
  const all = await getAllSeries();
  return all.flatMap((item) =>
    item.episodes.map((ep) => ({
      slug: item.slug,
      ep: ep.ep,
      updatedAt: item.updatedAt,
      isFree: ep.isFree,
    })),
  );
}
