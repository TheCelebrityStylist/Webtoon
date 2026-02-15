import { getGeneratedSeries } from "@/lib/generatedStore";
import type { CollectionKey, Episode, Series } from "@/lib/types";

const now = Date.now();
const day = 86_400_000;

const longEpisodeA = `The canal looked like polished obsidian when Livia arrived, except obsidian doesn't breathe.

At 23:58, the water rose by a centimeter and settled like it had changed its mind. She checked the weather app, checked it again, and then checked the bridge clock that was always wrong by two minutes. Tonight it was perfect.

A cyclist in a yellow scarf passed her, rung a bell, apologized in Dutch, and disappeared around the corner.

Twenty seconds later, the same cyclist returned from the same direction, repeated the same bell, repeated the same apology, and looked through Livia like she was a window.

The church clock struck midnight. The canal rippled against the current.

Livia's phone buzzed with a message she had answered yesterday: *Can we rewind this conversation?*

She laughed once, then stopped. Number 14 on the quay had petunias this morning; tonight it was bare soil. A bakery menu she photographed for a class project yesterday now advertised Monday soup.

On the stone steps, a stranger in a green coat watched the water with the patience of someone waiting for a train that never runs late.

"You noticed," they said.

"Noticed what?"

"That the city borrows days when someone asks hard enough."

Livia wanted to leave, call a friend, tell herself this was stress plus bad sleep. Instead she crouched, hovering her fingers above the water. Her reflection lagged behind her movement by half a second.

Then it changed.

In the water, Livia's face was older. A pale scar crossed her upper lip. Her expression was not fear. It was regret with excellent posture.

She jerked away.

"Every rewind has a receipt," the stranger said. "Memory. Chance. Someone else's ordinary happiness. The canal never gives discount trials."

"I didn't ask for this."

"No one does the first night."

Across the river, bells rang from three churches at once. The lights in the tram depot blinked in sequence, backward, then normal.

Livia swallowed. "What if I only need one more chance?"

The water formed concentric circles that climbed the stone like breath on glass.

The stranger stepped into the light. Their eyes were Livia's, ten years older.

"Then choose carefully," the older Livia whispered. "Tomorrow, someone will forget your name."`;

const longEpisodeB = `Iris always believed paper was kinder than people.

Paper let you layer mistakes. People framed them.

Her Rotterdam studio lived above a tram stop and smelled like coffee, graphite, and rental anxiety. At 08:12, a courier dropped a cardboard tube and an envelope sealed with a crest she had only seen in history books.

Inside: a tiny portrait of a royal grandmother and a note in impatient fountain pen.

*Your version made her look brave. Ours made her look obedient. We prefer brave. Come to Noordhaven Palace at 09:00. Bring brushes. — A*

At 08:20, Iris called Noor to read it aloud and laugh.

At 08:42, a black car with diplomatic plates arrived downstairs and waited.

The palace studio was immaculate and joyless. Gold frames. Soft light. Paintings with flawless technique and no pulse.

A man in a navy suit stood by the window. Paint on one cuff. Tired smile. "Adrian," he said. "Officially procurement. Unofficially the person who sent that note."

The contract included strict confidentiality and one line that stopped her cold: *Artist retains moral rights and original studies.*

She signed.

Week one: formal portraits.
Week two: private family studies.
Week three: friction.

A communications advisor circled Iris's sketch in red. "Too much tension in his hand. Make him look inevitable."

Iris folded her arms. "He's not inevitable. He's human."

Adrian entered mid-argument, scanned the page, and said, "Leave it."

The advisor forced a smile and left.

Later, in the wash room, a maid slipped Iris a folded note: *If they ask you to flatten us, paint us sharper.*

That evening Iris found a covered canvas in storage: the royal grandmother leading a rainy workers' protest, megaphone raised, laughing like thunder. A piece of official history someone had politely erased.

The next morning Adrian arrived with a split lip and no explanation.

"Tomorrow I'm announcing an open creator fund," he said quietly. "They'll call it disloyal. I need the portrait unveiled before the speech."

"Then we paint all night," Iris replied.

By dawn, they finished. By 08:57, the press room was full. At 08:59, a security officer whispered in Adrian's ear and he went still.

He found Iris in the crowd and mouthed two words.

*They know.*`;

const longEpisodeC = `Mara's newsroom badge stopped opening doors at 10:04.

At 10:05, her landlord texted that annual maintenance had been moved up to "today, urgently." At 10:06, an unknown number offered her a consulting contract triple her salary.

At 10:07, she finally accepted she wasn't in a bad week. She was in a campaign.

The file on her phone began as a transportation audit and ended as a map of favors: rezoning signatures, late-night permits, and one youth center closure hidden under a line item called "night safety optimization." Her mother's street appeared on page six.

Theo, her oldest friend and occasional legal realist, called from a stairwell. "You have action. You need intent."

"How long?"

"Hours, if we burn everything."

By noon, Mara posted one verified screenshot with context and pinned a calm thread explaining what it did and did not prove. She disabled replies from new accounts and enabled archive mode on all evidence.

Public reaction arrived in four predictable waves: disbelief, outrage, opportunism, and people quietly sending corroborating documents at 2 a.m.

At 13:41, she was invited to a "constructive dialogue" in a glass conference room overlooking the river.

"Let's keep this practical," said a man with perfect diction and unnervingly soft shoes.

"Practical for who?" Mara asked.

He smiled. "For everyone."

"Everyone never means everyone."

The wall display filled with charts proving fiscal necessity, projected stability, unavoidable trade-offs. Then he zoomed into one neighborhood block and tapped her family building with a laser pointer.

"These decisions are emotional for you," he said, as if compassion were a bargaining chip.

Mara asked for water, stepped out, and used six seconds by the dispenser to trigger a scheduled release to three journalists who disagreed on almost everything except contempt for corruption.

By 17:58, Theo arrived with a thumb drive and one bleeding knuckle.

"I got intent," he said. "Board audio."

Mara looked at the drive, then at the door, where three precise knocks landed.

Not loud. Not rushed.

Professional.

The lock turned from the outside.`;

const longEpisodeD = `Niki's drone flipped at Gate 3, clipped a sponsor banner, and died in a shower of carbon fiber and embarrassment.

The crowd at the underground Athens port race loved a failure they could post.

Niki loved a failure she could diagnose.

She stripped the frame on a plastic table while her grandmother sent voice notes from the olive farm: weather updates, irrigation worries, and one gentle reminder that pride doesn't pay workers.

A man in a white shirt approached with the relaxed confidence of someone who had never soldered his own motor mount.

"Your control logic is elegant," he said. "Your hardware is poor. I can fix one of those for you."

He offered sponsorship. Money upfront. Travel support. Replacement parts by morning.

The contract looked clean until clause 14: sponsor retains adaptive telemetry and derivative optimization rights.

"You own my race brain forever," Niki said.

"We own what we improve," he replied.

She declined.

At midnight, an official notice arrived: her league registration was suspended pending compliance review.

At 00:06, a second message arrived from an encrypted address with one line: *If the top league shuts its door, race under the waterline. Saturday. Bring courage and spare batteries.*

Niki packed both.`;

const longEpisodeE = `At Aurora Market, customers paid in memories.

Not metaphorically. Literally.

Sanni inherited Stall 19 from an aunt she barely knew and a ledger she couldn't read. Every sale left a tiny blankness behind the eyes. One woman bought a lantern and forgot the smell of pine forests. A teen bought a silver ring and lost the melody of his favorite lullaby.

Sanni kept receipts anyway.

A city auditor appeared on Friday with legal forms and a polite smile. "We're reviewing unauthorized emotional commerce," he said.

"We sell handmade objects," Sanni answered.

"Then why does your inventory change when no deliveries arrive?"

That night, she opened the ledger under the awning light and discovered entries writing themselves: customer names, memory categories, and one line in ink that hadn't dried.

*Outstanding debt: one happiest day.*

Her name sat beside it.

The market bells rang closing time. None of the stalls closed.`;

const longEpisodeF = `The pirate station lived in an abandoned Berlin cinema where velvet seats held dust and old laughter.

Leonie, unpaid intern by title and overqualified producer by reality, accidentally routed her private test playlist to FM. Twelve minutes later, strangers were calling in to say the city felt warmer.

She expected a warning.

She got a cease-and-desist.

Milo, retired DJ and patron saint of unnecessary confidence, grinned. "If they heard us, they need us."

"If they sue us, they bury us," Leonie said.

They compromised by doing both: better signal discipline and bolder programming.

The second broadcast asked listeners what they needed to hear at 01:13. A nurse requested silence between songs because silence proved she was still awake. A taxi driver requested anything without algorithmic sameness. A city councillor called under a fake name and requested a protest anthem banned from municipal events.

The station became a map of people refusing to be optimized.

At 02:47, power dropped.

Backup lights switched on. Milo checked the breaker and came back pale.

"We're not alone," he whispered.

From the projection booth above, an old reel began to spin by itself, filling the wall with static and one phrase in block letters:

*PAY RENT OR SURRENDER THE SIGNAL.*`;

const longBodies: string[] = [longEpisodeA, longEpisodeB, longEpisodeC, longEpisodeD, longEpisodeE, longEpisodeF];

const languageMap = ["en", "fr", "de", "nl", "es", "it", "pt", "pl", "sv", "fi", "el", "cs"];
const genrePools = [
  ["Romance", "Drama"],
  ["Mystery", "Thriller"],
  ["Fantasy", "Slice of Life"],
  ["Sci-Fi", "Drama"],
];

const seedSeries = [
  ["midnight-canal", "Midnight Canal", "Studio Lumen", "Moonlit canal with electric ripples"],
  ["paper-crown", "Paper Crown", "Mira Vale", "Paper crown on a painter's desk"],
  ["glass-harbor", "Glass Harbor", "Noor Atelier", "Rain over modern harbor lights"],
  ["olive-circuit", "Olive Circuit", "Helios Lab", "Racing drone above olive fields"],
  ["aurora-market", "Aurora Market", "Northline Stories", "Lantern market in winter"],
  ["vinyl-hearts", "Vinyl Hearts", "Kai Morgen", "Turntable in a retro cinema"],
  ["tram-17", "Tram 17", "Lotte de Vries", "Night tram with fogged windows"],
  ["atlas-of-rain", "Atlas of Rain", "Ria Oeste", "Weather map over city rooftops"],
  ["neon-mosaic", "Neon Mosaic", "Atelier Delta", "Mural artist under neon signs"],
  ["quiet-fire", "Quiet Fire", "Celine Dubois", "Kitchen flame in dark service"],
  ["winter-index", "Winter Index", "Aino K", "Notebook and snow-lit street"],
  ["signal-bridge", "Signal Bridge", "Rafa Costa", "Bridge antennas at sunset"],
  ["hollow-garden", "Hollow Garden", "Iris Kohn", "Overgrown greenhouse at dusk"],
  ["night-bakery", "Night Bakery", "Emma Rossi", "Fresh pastries at midnight"],
  ["river-laws", "River Laws", "Pavel S", "Courthouse by a river"],
  ["copper-stars", "Copper Stars", "Ines Moreau", "Copper observatory dome"],
  ["slow-comet", "Slow Comet", "Greta Holm", "Comet trail above old city"],
  ["afterlight", "Afterlight", "Theo Marin", "Neon skyline after rain"],
] as const;

function makeEpisode(seriesTitle: string, ep: number, isFree: boolean, body: string): Episode {
  return {
    ep,
    title: ep === 1 ? "Pilot" : ep === 2 ? "Pressure Line" : ep === 3 ? "Countermove" : ep === 4 ? "Quiet Cost" : "Threshold",
    publishedAt: new Date(now - (ep + 2) * day).toISOString(),
    isFree,
    fastPass: !isFree,
    readingTime: Math.max(4, Math.round(body.split(" ").length / 210)),
    excerpt: `${seriesTitle} escalates in episode ${ep} with sharper stakes and a stronger cliffhanger.`,
    content: body,
  };
}

function shortBody(title: string, ep: number) {
  return `${title} episode ${ep} opens on a decisive choice and closes on an even harder one.\n\nA new ally appears with useful information and inconvenient timing.\n\nBy the final panel, the protagonist gains leverage but loses safety.\n\nThe next episode begins with consequences already in motion.`;
}

export const seriesIndex: Series[] = seedSeries.map((entry, index) => {
  const [slug, title, creatorName, coverAlt] = entry;
  const lang = languageMap[index % languageMap.length];
  const genres = genrePools[index % genrePools.length];
  const tags = ["Vertical", "Weekly", genres[0], index % 2 === 0 ? "Character-driven" : "High-stakes"];
  const longBody = longBodies[index % longBodies.length];

  return {
    slug,
    title,
    creatorName,
    language: lang,
    genres,
    tags,
    coverAlt,
    coverUrl: `/covers/${slug}.svg`,
    logline: `${title} follows a lead character navigating public pressure, private loyalty, and irreversible decisions.`,
    description: `${title} is a premium vertical serial with cinematic pacing and clear weekly episode momentum.`,
    longDescription: `${title} blends ${genres.join(" + ")} with a European editorial lens. Readers start free and decide when to unlock early with Fast Pass credits. Every chapter ends with a meaningful choice and measurable consequence.`,
    updatedAt: new Date(now - index * 3 * 60 * 60 * 1000).toISOString(),
    stats: {
      betaReads: 1200 + index * 340,
      betaRating: Number((4.2 + (index % 6) * 0.11).toFixed(2)),
    },
    contentWarnings: index % 4 === 0 ? ["Mild language", "Emotional conflict"] : undefined,
    episodes: [
      makeEpisode(title, 1, true, longBody),
      makeEpisode(title, 2, true, shortBody(title, 2)),
      makeEpisode(title, 3, false, shortBody(title, 3)),
      makeEpisode(title, 4, false, shortBody(title, 4)),
      makeEpisode(title, 5, false, shortBody(title, 5)),
    ],
  };
});

export const series: Series[] = seriesIndex;

export const collections: Record<CollectionKey, string[]> = {
  trending: seriesIndex.slice(0, 12).map((s) => s.slug),
  newThisWeek: seriesIndex.slice(6, 12).map((s) => s.slug),
  staffPicks: ["paper-crown", "aurora-market", "vinyl-hearts", "atlas-of-rain", "night-bakery", "afterlight"],
  under10: seriesIndex.filter((s) => s.episodes[0].readingTime <= 10).slice(0, 12).map((s) => s.slug),
  romance: seriesIndex.filter((s) => s.genres.includes("Romance")).map((s) => s.slug),
  mystery: seriesIndex.filter((s) => s.genres.includes("Mystery")).map((s) => s.slug),
  fantasy: seriesIndex.filter((s) => s.genres.includes("Fantasy")).map((s) => s.slug),
  sliceOfLife: seriesIndex.filter((s) => s.genres.includes("Slice of Life")).map((s) => s.slug),
  dutchSpotlight: seriesIndex.filter((s) => s.language === "nl").map((s) => s.slug),
  frenchSpotlight: seriesIndex.filter((s) => s.language === "fr").map((s) => s.slug),
  germanSpotlight: seriesIndex.filter((s) => s.language === "de").map((s) => s.slug),
};

function byUpdatedDesc(a: Series, b: Series) {
  return a.updatedAt < b.updatedAt ? 1 : -1;
}

export async function getAllSeries(): Promise<Series[]> {
  const generated = await getGeneratedSeries();
  return [...generated, ...seriesIndex].sort(byUpdatedDesc);
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const generated = await getGeneratedSeries();
  return generated.find((s) => s.slug === slug) ?? seriesIndex.find((s) => s.slug === slug) ?? null;
}

export function getEpisode(seriesItem: Series, ep: number): Episode | null {
  return seriesItem.episodes.find((e) => e.ep === ep) ?? null;
}

export async function getCollectionSeries(key: CollectionKey, limit?: number): Promise<Series[]> {
  const all = await getAllSeries();
  const slugs = collections[key];
  const ordered = slugs.map((slug) => all.find((s) => s.slug === slug)).filter(Boolean) as Series[];
  return typeof limit === "number" ? ordered.slice(0, limit) : ordered;
}
