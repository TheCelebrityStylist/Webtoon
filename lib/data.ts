import type { Episode, Series } from "@/lib/types";
import { getGeneratedSeries } from "@/lib/generatedStore";

const now = new Date();
const iso = (d: Date) => d.toISOString();

const canalEpisodeOne = `At 23:58, the Maastricht canal looked like black glass. Livia stood on the bridge with a backpack full of lecture notes she had promised herself she would read and a heart she had promised herself she would not break again. Under the sodium lamps, the water refused to behave. It didn’t drift. It seemed to wait.

A bike bell rang behind her. She stepped aside. The same rider passed her twice in less than a minute, same yellow scarf, same bent wheel, same muttered apology. Livia laughed once, then looked at her phone. Her lock screen showed Monday. She could swear this was Tuesday.

At midnight, the church bell struck once. A ripple moved against the current like a hand sweeping crumbs off a table. Streetlights blinked out and back on. A tram in the distance paused, jerked backward, and continued forward as if nothing happened.

Livia opened her messages. A conversation with her ex appeared unread: *Can we talk tomorrow?* She had answered it yesterday. The answer was gone.

She walked the quay, counting painted house numbers, forcing logic over panic. Number 14 had a flower box in bloom this morning. Now it was empty soil. A bakery she bought coffee from every day had today’s chalkboard menu replaced with yesterday’s soup.

When she reached the old stone steps by the water, she saw someone leaning there in a deep green coat. Not a student. Not a tourist. Their face stayed in shadow.

“You noticed,” they said, not asking.

“Noticed what?” Livia heard her voice shake and hated it.

“The city borrows a day when someone asks hard enough.”

“I didn’t ask for anything.”

The stranger tilted their head. “That’s what everyone says the first night.”

Livia should have left. Instead she crouched by the edge, fingertips hovering over the surface. The canal reflected her face a half-second too late, like a lagging video feed. Then it reflected someone older, with silver in their hair and a scar above their lip.

She jerked back. Her pulse roared in her ears.

“Every rewind has a receipt,” the green-coat stranger said. “Memory. Chance. Someone else’s good day. The water never gives a discount.”

Livia stared at the canal and, against every sensible instinct, whispered, “What if I only need one more chance?”

The water answered with concentric rings that spread to both banks and climbed the stone like breath on glass. Somewhere across the river, every church bell rang at once though none of the clocks struck midnight.

The stranger finally stepped into the light. Their eyes were pale and tired and familiar in a way that made Livia’s stomach drop.

“Then choose carefully,” they said. “Tomorrow, someone will forget your name.”`;

const atelierEpisodeOne = `Iris used to say that paper was kinder than people. Paper forgave mistakes if you layered enough paint and kept your hand steady. People remembered your worst line forever.

In a narrow studio above a Rotterdam tram stop, she painted fake portraits for restaurants that wanted “heritage atmosphere” without museum prices. Tuesday morning, a courier delivered an unmarked tube and an envelope with thick cream paper.

Inside: a miniature portrait of a royal grandmother and a note written in impatient fountain-pen strokes.

*Your version makes her look brave. Ours makes her look obedient. We prefer brave. Report to Noordhaven Palace at 09:00. Bring your brushes. —A.*

Iris laughed, called her best friend Noor, read it out loud, and laughed again when Noor swore it had to be a prank. Then a black car arrived at 08:15 and waited downstairs with diplomatic plates.

The palace studio smelled like turpentine and old cedar. Gold-framed canvases lined the walls, all technically flawless and emotionally sterile. A man in his late twenties stood by the window in a navy suit with paint on one cuff.

“I’m Adrian,” he said. “Officially, I’m here to review procurement. Unofficially, I asked for you.”

She narrowed her eyes. “You’re the note?”

He smiled like he knew the smile would be disarming and was tired of using it. “Guilty.”

Over tea she did not touch, he explained the job: a new portrait cycle before spring diplomatic season. “We need honesty that still photographs well,” he said.

“Honesty rarely photographs well,” Iris replied.

“Exactly why we hired you.”

The contract arrived with three pages of confidentiality clauses and one short line that made her pause: *Artist retains moral rights and original studies.*

She signed.

By week two, she noticed things no one mentioned aloud. The queen’s personal aide never stayed in the same doorway for long. A junior footman delivered letters to the wrong rooms and cried in stairwells. Adrian skipped two sittings, then arrived with a split lip and an apology he refused to explain.

During a rainstorm, Iris found an old canvas in storage covered by muslin. It showed the palace dock thirty years earlier, crowded with people carrying handmade signs. At the edge stood the same grandmother from the miniature portrait, holding a megaphone, soaked and grinning.

A maid appeared behind her. “That one was removed from public rooms,” she whispered. “Too political.”

“Who removed it?”

The maid didn’t answer. She pressed a folded note into Iris’s palm and left.

The note read: *If they ask you to flatten us, paint us sharper.*

That night, Iris repainted Adrian’s posture from upright and ceremonial to subtly defensive, one hand curled around the back of a chair as if bracing for impact. It was truthful. It was also dangerous.

At final review, a communications advisor circled that hand with a red pencil. “Too tense. Make him look inevitable.”

Iris crossed her arms. “He isn’t inevitable. He’s human.”

Silence stretched. Adrian entered midway through the argument, looked at the marked-up draft, then at Iris.

“Leave it,” he said quietly.

The advisor frowned. “Sir, this will be interpreted—”

“Good,” Adrian said.

After everyone else left, he stood beside the canvas for a long time. “You made me look like someone who can still choose,” he said. “No one has done that here in years.”

Iris cleaned her brushes at the stone sink, pretending not to feel the room tilt.

“Then choose,” she said.

He turned to her, eyes rimmed with sleeplessness. “If I do, they’ll come for the painter first.”

Somewhere in the palace, an alarm chimed once and stopped. Adrian stepped closer, voice barely above breath.

“Tomorrow I’m announcing an open creator fund for independent artists. They will call it reckless. They will call it disloyal. I need the portrait unveiled before the speech.”

Iris looked at the canvas, at the red pencil marks, at the wet city beyond stained glass.

“Then we paint all night,” she said.

By dawn, the portrait was finished. By eight, the palace press room was full. At 08:57, a staff member ran in and whispered in Adrian’s ear. His face drained.

He looked across the crowd, found Iris in the back row, and mouthed two words she felt more than heard: *They know.*`;

function episode(ep: number, title: string, isFree: boolean, excerpt: string, content: string): Episode {
  return {
    ep,
    title,
    publishedAt: iso(new Date(now.getTime() - ep * 86400000 * 7)),
    isFree,
    fastPass: !isFree,
    readingTime: Math.max(4, Math.min(18, Math.round(content.split(" ").length / 220))),
    excerpt,
    content,
  };
}

const short = (line: string) => `${line}\n\nThe episode closes on a sharp turn: a secret call, a missed train, or a confession that lands too late.`;

export const seriesIndex: Series[] = [
  {
    slug: "midnight-canal",
    title: "Midnight Canal",
    logline: "A Maastricht student finds a canal that rewinds time, but every rewind invoices someone else.",
    description: "Mystery romance with folklore rules, moral cost, and cliffhangers built for vertical reading.",
    longDescription: "Livia discovers that the canal can return yesterday for a price. Every episode asks the same question in new ways: what are you willing to sacrifice for one more chance?",
    language: "en",
    genres: ["Mystery", "Urban Fantasy", "Romance"],
    tags: ["Time loop", "Slow-burn", "European folklore"],
    creatorName: "Studio Lumen",
    coverAlt: "Moonlit canal with glowing ripples",
    coverUrl: "/covers/midnight-canal.svg",
    updatedAt: iso(now),
    episodes: [
      episode(1, "The Ripple", true, "The city slips backward by a day after midnight.", canalEpisodeOne),
      episode(2, "Borrowed Hours", true, "Livia tracks what each rewind steals from the city.", short("A classmate forgets her entirely after a rewind.")),
      episode(3, "The Price", false, "She pays to save a friend and loses a memory she cannot replace.", short("The canal offers one final bargain.")),
    ],
  },
  {
    slug: "paper-crown",
    title: "Paper Crown",
    logline: "A freelance illustrator gets hired by a royal household that needs truth more than propaganda.",
    description: "Character-driven palace drama with romantic tension, ethics, and creative rebellion.",
    longDescription: "Iris paints people as they are, not as institutions want them to appear. Inside a modern monarchy, that makes her both essential and dangerous.",
    language: "en",
    genres: ["Drama", "Romance", "Slice of Life"],
    tags: ["Court intrigue", "Artist lead", "Slow burn"],
    creatorName: "Mira Vale",
    coverAlt: "Paper crown and paintbrushes on a velvet chair",
    coverUrl: "/covers/paper-crown.svg",
    updatedAt: iso(new Date(now.getTime() - 3600000)),
    episodes: [
      episode(1, "Commission of a Lifetime", true, "An unofficial palace request changes Iris's career overnight.", atelierEpisodeOne),
      episode(2, "Red Pencil Notes", true, "A political advisor demands safer art; Iris refuses.", short("The portrait reveals a hidden family fracture.")),
      episode(3, "Speech Day", false, "Adrian goes public, and the backlash begins before he reaches the podium.", short("Someone leaks Iris's private drafts.")),
    ],
  },
  {
    slug: "tram-17",
    title: "Tram 17",
    logline: "Three strangers relive the same commute until they solve who never gets off at the terminal.",
    description: "High-concept mystery thriller told in tight, visual beats.",
    longDescription: "Every morning at 07:42, Tram 17 departs. Every morning one seat remains occupied by someone no one can remember afterward.",
    language: "en",
    genres: ["Thriller", "Mystery"],
    tags: ["Transit noir", "Puzzle", "Short arcs"],
    creatorName: "Lotte de Vries",
    coverAlt: "Night tram crossing a wet city street",
    coverUrl: "/covers/tram-17.svg",
    updatedAt: iso(new Date(now.getTime() - 7200000)),
    episodes: [
      episode(1, "07:42", true, "A skipped stop starts a chain of impossible déjà vu.", short("The driver swears the route map changed mid-ride.")),
      episode(2, "Last Passenger", true, "They finally see the mystery rider's reflection.", short("Security footage records everyone except seat 23.")),
      episode(3, "Terminal", false, "The loop breaks only if one of them stays behind.", short("A name appears on the window fog.")),
    ],
  },
  {
    slug: "salt-and-neon",
    title: "Salt & Neon",
    logline: "A Marseille line cook moonlights as a hacker to pay his sister's legal fees.",
    description: "Kinetic crime drama with food culture and family stakes.",
    longDescription: "Chef by day, ghost coder by night, Ilias has 30 days to clear a debt before the people he loves become collateral.",
    language: "fr",
    genres: ["Crime", "Drama"],
    tags: ["Kitchen life", "Heist", "Family"],
    creatorName: "Atelier Rue Sud",
    coverAlt: "Neon sign reflecting in seawater",
    coverUrl: "/covers/salt-and-neon.svg",
    updatedAt: iso(new Date(now.getTime() - 10800000)),
    episodes: [episode(1, "Service", true, "Dinner rush, then an encrypted job offer.", short("The kitchen ticket printer outputs a bank account number.")), episode(2, "Ghost Shift", true, "A simple breach turns into a trap.", short("Someone in the brigade is feeding intel.")), episode(3, "Forty-Two Minutes", false, "He has one window to erase the debt ledger.", short("His sister's case file vanishes."))],
  },
  {
    slug: "aurora-market",
    title: "Aurora Market",
    logline: "At a Helsinki night market, vendors trade in memories disguised as handmade goods.",
    description: "Cozy fantasy with emotional stakes and found-family energy.",
    longDescription: "Sanni inherits a small lantern stall and discovers customers pay with moments from their past.",
    language: "en",
    genres: ["Fantasy", "Slice of Life"],
    tags: ["Cozy", "Magic realism", "Found family"],
    creatorName: "Northline Stories",
    coverAlt: "Snowy market lights and paper lanterns",
    coverUrl: "/covers/aurora-market.svg",
    updatedAt: iso(new Date(now.getTime() - 14400000)),
    episodes: [episode(1, "Lantern Debt", true, "Sanni sells her first lantern and loses a childhood smell.", short("A customer asks for a memory she never lived.")), episode(2, "Warm Hands", true, "She learns to price joy without exploiting grief.", short("Her ledger writes entries by itself.")), episode(3, "Closing Bell", false, "The market demands she auction her happiest day.", short("Someone bids with her mother's laugh."))],
  },
  {
    slug: "vinyl-hearts",
    title: "Vinyl Hearts",
    logline: "A Berlin radio intern and a retired DJ rebuild a pirate station from an abandoned cinema.",
    description: "Warm comedy-drama with music scenes and romantic sparks.",
    longDescription: "When city permits shut down indie venues, two unlikely collaborators launch midnight broadcasts that become a movement.",
    language: "de",
    genres: ["Drama", "Comedy", "Romance"],
    tags: ["Music", "Community", "Workplace"],
    creatorName: "Kai Morgen",
    coverAlt: "Turntable glowing under stage lights",
    coverUrl: "/covers/vinyl-hearts.svg",
    updatedAt: iso(new Date(now.getTime() - 18000000)),
    episodes: [episode(1, "Dead Air", true, "An accidental broadcast goes viral overnight.", short("A city councillor calls in under a fake name.")), episode(2, "B-Side", true, "They crowdsource the next set list live.", short("The station receives a cease-and-desist.")), episode(3, "Signal Loss", false, "To stay on-air, someone must reveal their identity.", short("The cinema owner returns unexpectedly."))],
  },
  {
    slug: "atlas-of-rain",
    title: "Atlas of Rain",
    logline: "A Lisbon climate cartographer maps storms that follow emotions, not weather models.",
    description: "Speculative drama balancing science, grief, and hope.",
    longDescription: "Marta's predictive maps save districts from floods, but each successful forecast amplifies one storm she cannot explain: her own.",
    language: "pt",
    genres: ["Sci-Fi", "Drama"],
    tags: ["Climate fiction", "Data", "Emotional mystery"],
    creatorName: "Ria Oeste",
    coverAlt: "Rain map overlay on city rooftops",
    coverUrl: "/covers/atlas-of-rain.svg",
    updatedAt: iso(new Date(now.getTime() - 21600000)),
    episodes: [episode(1, "Blue Grid", true, "Her model predicts sunshine; hail arrives.", short("A handwritten correction appears on her monitor.")), episode(2, "Pressure Line", true, "She links anomalies to unresolved memories.", short("The mayor requests a private forecast.")), episode(3, "Storm Archive", false, "Marta opens a sealed weather vault.", short("Inside is a map in her own handwriting."))],
  },
  {
    slug: "olive-circuit",
    title: "Olive Circuit",
    logline: "In Athens, a robotics student enters underground drone races to fund her grandmother's olive farm.",
    description: "Sports-tech underdog story with family warmth.",
    longDescription: "Niki designs elegant machines for impossible tracks, racing against sponsors who can buy better hardware but not better instincts.",
    language: "el",
    genres: ["Action", "Sports", "Family"],
    tags: ["Underdog", "Tech", "Rural roots"],
    creatorName: "Helios Lab",
    coverAlt: "Drone streaking over olive groves at sunset",
    coverUrl: "/covers/olive-circuit.svg",
    updatedAt: iso(new Date(now.getTime() - 25200000)),
    episodes: [episode(1, "Practice Lap", true, "Niki's prototype crashes in public and wins a private sponsor.", short("The sponsor's contract includes a hidden ownership clause.")), episode(2, "No Fly Zone", true, "Officials ban her from the main league overnight.", short("She is invited to a secret race under the port.")), episode(3, "Final Gate", false, "The last race decides the farm's future.", short("Her rival offers to split the prize for a favor."))],
  },
];

// Backward-compatible alias for older imports
export const series: Series[] = seriesIndex;

export async function getAllSeries(): Promise<Series[]> {
  const generated = await getGeneratedSeries();
  const merged = [...generated, ...seriesIndex];
  return merged.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const generated = await getGeneratedSeries();
  return generated.find((item) => item.slug === slug) ?? seriesIndex.find((item) => item.slug === slug) ?? null;
}

export function getEpisode(seriesItem: Series, ep: number): Episode | null {
  return seriesItem.episodes.find((entry) => entry.ep === ep) ?? null;
}
