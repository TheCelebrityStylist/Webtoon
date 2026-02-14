"use client";

import { useMemo, useState } from "react";

type StudioOutput = {
  title: string;
  logline: string;
  bible: string;
  outline: string;
  fullEpisode: string;
  marketing: string;
};

const genres = ["Romance", "Mystery", "Fantasy", "Drama", "Thriller", "Sci-Fi"];
const tones = ["Hopeful", "Dark", "Tender", "Cinematic", "Comedic", "Gritty"];

function seedFrom(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash;
}

function pick<T>(arr: T[], seed: number, offset: number) {
  return arr[(seed + offset) % arr.length];
}

function generateLongStory(prompt: string, genre: string, tone: string, protagonist: string): StudioOutput {
  const seed = seedFrom(`${prompt}-${genre}-${tone}-${protagonist}`);
  const city = pick(["Rotterdam", "Lisbon", "Prague", "Naples", "Tallinn", "Brussels"], seed, 7);
  const title = `${pick(["Glass", "Velvet", "Midnight", "Copper", "Paper", "Neon"], seed, 1)} ${pick(["Signal", "Harbor", "Promise", "Archive", "Orbit", "Crown"], seed, 5)}`;
  const conflict = pick([
    "a secret that can rewrite reputations",
    "a debt that compounds every sunrise",
    "an algorithm that predicts heartbreak",
    "a family pact no one remembers signing",
    "a missing person case hidden in plain sight",
  ], seed, 11);

  const bible = `SERIES BIBLE\n\nTitle: ${title}\nGenre: ${genre}\nTone: ${tone}\nPrimary setting: ${city}, in a near-contemporary Europe where social pressure moves faster than official truth.\n\nCore premise\n${protagonist} is pulled into ${conflict}. Each chapter balances emotional consequence with momentum-driven reveals. The vertical format uses cliff paragraphs, clean scene pivots, and visual beats designed for mobile scrolling.\n\nThemes\n1. Ambition without self-erasure\n2. The cost of being "the reliable one"\n3. Community as strategy, not decoration\n4. Truth vs. performative narratives\n\nCharacter arcs\n- ${protagonist}: starts reactive, becomes decisive, then learns leadership is shared.\n- Deuteragonist: a rival with better optics, worse timing, and a hidden loyalty.\n- Antagonist force: not one villain, but a system that rewards silence.\n\nWorld rules\n- Information has currency value.\n- Public image can open doors faster than competence, but only competence keeps them open.\n- Every major victory creates a moral invoice paid in the following episode.`;

  const outline = `10-EPISODE OUTLINE\n\nEp 1: Cold Open Debt — ${protagonist} receives proof that their safe life is already compromised.\nEp 2: False Ally — a helpful contact offers access at a hidden price.\nEp 3: First Win, Hidden Loss — public momentum rises while private trust fractures.\nEp 4: Midpoint Reveal — the conflict is larger and older than expected.\nEp 5: Public Failure — a miscalculation becomes headline news.\nEp 6: Quiet Episode — character-driven recovery, strategy reset, and relationship honesty.\nEp 7: Counterattack — ${protagonist} weaponizes transparency.\nEp 8: Collapse — key support disappears; a betrayal lands.\nEp 9: Last Leverage — one risky move can reset the board.\nEp 10: Choice, Not Closure — a decisive win with a consequence that seeds season two.`;

  const fullEpisode = `FULL EPISODE SCRIPT (VERTICAL-FIRST)\n\nPanel Beat 1 — Establishing\nRain glazed the tram tracks and turned every light into a long neon bruise. ${protagonist} stood under an awning in ${city}, thumb pressed to a cracked phone screen, reading the same message for the fourth time because disbelief was cheaper than action. *If you want the truth, come alone.*\n\nPanel Beat 2 — Internal hook\nMost people think fear arrives all at once. It doesn't. It arrives in receipts: a locked account, a missed call from someone who never misses, a stranger saying your name with too much confidence. ${protagonist} had collected a full wallet of receipts by 07:10.\n\nPanel Beat 3 — Decision\nThey could go to work and pretend. They could forward the message and call it due diligence. They could wait. Waiting was how small disasters became civic architecture. So they walked.\n\nPanel Beat 4 — Atmosphere turn\nThe underpass smelled like metal and old rain. Footsteps echoed ahead, then behind, then nowhere. A mural on the wall had been tagged overnight; someone painted over one specific word in red: *witness*.\n\nPanel Beat 5 — First reveal\nAt the end of the tunnel, a woman in a charcoal coat slid an envelope across a cement bench without making eye contact. “You are not in danger because you found this,” she said. “You are in danger because someone needs you to ignore it.”\n\nPanel Beat 6 — Artifact\nInside: three photos, one municipal invoice, and a handwritten timeline connecting names that should never appear on the same page. One of them was ${protagonist}'s. Not a typo. Not a coincidence. A role assignment.\n\nPanel Beat 7 — Moral tension\nThe fastest path was obvious: sell the file, disappear, let someone wealthier carry the fallout. But the file included a youth center closure, a relocated family, and a signature from the person who taught ${protagonist} how to negotiate without raising their voice.\n\nPanel Beat 8 — Character depth\nThere is a specific grief reserved for discovering that your mentors are not villains, just tired people who chose convenience on a Thursday and never found their way back. ${protagonist} folded the page along that signature until the paper nearly split.\n\nPanel Beat 9 — Contact attempt\nThey called Theo, the one person who understood both city policy and emotional triage. Voicemail. Called again. Voicemail. Texted: *Need you now. Not dramatic. Real.* No blue tick.\n\nPanel Beat 10 — Micro-victory\nA choice creates momentum. ${protagonist} opened a private channel, uploaded only one photo, and scheduled release for 18:00 with a dead-man switch. If anything happened, the file would publish everywhere at once. Not bravery. Architecture.\n\nPanel Beat 11 — Countermove\nBy lunch, two things happened: an unknown number offered them a consulting contract triple their salary, and their access badge stopped opening office doors. Friendly pressure in a tailored suit.\n\nPanel Beat 12 — Dialogue duel\n“Let's keep this constructive,” the suit said in a glass conference room.\n“Constructive for who?” ${protagonist} asked.\n“For everyone.”\n“Everyone never means everyone.”\n\nPanel Beat 13 — Stakes raise\nA slideshow appeared on the wall: housing figures, migration curves, budget deficits, all the mathematically clean reasons people accept human mess as policy collateral. Then the suit zoomed in on a line item: the street where ${protagonist}'s mother still lived.\n\nPanel Beat 14 — Pressure response\nThreats that sound like strategic concern are the most expensive kind. ${protagonist} nodded as if convinced, asked for water, and used the walk to the dispenser to trigger a backup send to three journalists with opposite political leanings. No single narrative would own this story.\n\nPanel Beat 15 — Emotional anchor\nOutside, the rain had stopped. Theo finally called, voice rough. “I read enough to know you don't have enough,” he said. “You have proof of action, not intent. Intent is what survives court.”\n\nPanel Beat 16 — Mid-episode pivot\n“Can you get intent?” ${protagonist} asked.\n“I can get a meeting recording,” Theo said. “But if I do, I burn my last favor. After that, we're on our own.”\n“We were always on our own.”\n\nPanel Beat 17 — Quiet beat\nThey met at a bakery that sold cardamom rolls and overcharged for chairs. For ten minutes they talked about anything except crisis—music, bad coffee, a teacher they both loved—because panic narrows vision and friendship reopens it.\n\nPanel Beat 18 — Plan assembly\nThe plan was ugly but viable: leak one verified fragment, force public response, then surface full intent record within 24 hours before spin teams could consolidate. Slow enough to feel responsible. Fast enough to outrun suppression.\n\nPanel Beat 19 — First publication\n18:00 hit. The scheduled file released. Not the whole vault, just enough to make denial impossible. Comments flooded in: outrage, skepticism, opportunism, genuine help, conspiracy cosplay. Public attention is never pure; it is still useful.\n\nPanel Beat 20 — Consequence\nAt 18:12, ${protagonist}'s landlord texted that their lease review had been “accelerated.” At 18:14, their sister texted from university: *Why is your name trending? Are you okay?* At 18:16, the charcoal-coat woman sent one line: *Good first move. Bad timing.*\n\nPanel Beat 21 — Cliff setup\nTheo arrived at the safe apartment with a thumb drive and a split knuckle. He held up the drive like it weighed more than metal should. “I got intent,” he said. “And I brought company.”\n\nPanel Beat 22 — Cliffhanger\nA shadow moved across the frosted hallway glass. Three knocks. Not aggressive. Precise. ${protagonist} looked at Theo, then at the drive, then at the door as the lock turned from the outside.\n\nEND NOTE\nThis episode is intentionally long-form for conversion demos: it showcases vertical pacing, character-forward stakes, and a hook that encourages immediate episode-two clicks.`;

  const marketing = `MARKETING COPY\n\nBlurb\nWhen a quiet professional in ${city} uncovers evidence of ${conflict}, survival means moving faster than institutions and slower than panic. ${title} blends ${genre.toLowerCase()} momentum with ${tone.toLowerCase()} emotional stakes.\n\nTrailer text\nOne message. One file. One day before the story controls you.\n\nSuggested tags\n#${genre.replace(/\s+/g, "")} #${tone.replace(/\s+/g, "")} #VerticalReading #EUCreators #FastPass`;

  return {
    title,
    logline: `${protagonist} confronts ${conflict} in ${city} and discovers reputation is the first battlefield.`,
    bible,
    outline,
    fullEpisode,
    marketing,
  };
}

export function AIStudioForm() {
  const [prompt, setPrompt] = useState("A creator who uncovers a civic conspiracy while trying to protect their family.");
  const [protagonist, setProtagonist] = useState("Mara, a multilingual producer");
  const [genre, setGenre] = useState(genres[0]);
  const [tone, setTone] = useState(tones[0]);
  const [output, setOutput] = useState<StudioOutput | null>(null);
  const [savingMessage, setSavingMessage] = useState("");

  const markdown = useMemo(() => {
    if (!output) return "";
    return `# ${output.title}\n\n${output.logline}\n\n${output.bible}\n\n${output.outline}\n\n${output.fullEpisode}\n\n${output.marketing}`;
  }, [output]);

  function onGenerate() {
    setOutput(generateLongStory(prompt, genre, tone, protagonist));
  }

  function onCopy() {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown).then(() => setSavingMessage("Copied to clipboard."));
  }

  function onDownload() {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${output?.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "studio-output"}.md`;
    a.click();
    URL.revokeObjectURL(href);
    setSavingMessage("Downloaded markdown file.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Try AI Studio</h2>
        <p className="mt-2 text-sm text-slate-600">Generate a full series bible, episode outlines, script beats, and launch copy in one flow.</p>

        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate-700">Series concept
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" rows={4} />
          </label>
          <label className="block text-sm font-medium text-slate-700">Protagonist
            <input value={protagonist} onChange={(e) => setProtagonist(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-slate-700">Genre
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3">
                {genres.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Tone
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3">
                {tones.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <button type="button" onClick={onGenerate} className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Generate studio package</button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Capabilities</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Series bible: themes, rules, character arcs</li>
          <li>10-episode outline with escalating stakes</li>
          <li>Long-form vertical script beats (conversion demo quality)</li>
          <li>Marketing copy: blurb, trailer text, discoverability tags</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={onCopy} disabled={!output} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Copy to clipboard</button>
          <button type="button" onClick={onDownload} disabled={!output} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Download .md</button>
        </div>
        {savingMessage ? <p className="mt-3 text-xs text-emerald-700">{savingMessage}</p> : null}
      </section>

      {output ? (
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">{output.title}</h3>
          <p className="mt-2 text-sm text-slate-700">{output.logline}</p>
          <pre className="mt-4 max-h-[640px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{markdown}</pre>
        </section>
      ) : null}
    </div>
  );
}
