"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Output = {
  title: string;
  logline: string;
  seriesBible: string;
  outline: string;
  script: string;
  marketing: string;
};

const tabs = ["Series Bible", "Episode Outline", "Script", "Marketing"] as const;
type Tab = (typeof tabs)[number];

function hash(text: string) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) >>> 0;
  return value;
}

function pick<T>(items: T[], seed: number, offset: number) {
  return items[(seed + offset) % items.length];
}

function generate(inputs: { concept: string; protagonist: string; tone: string; genre: string }): Output {
  const seed = hash(`${inputs.concept}-${inputs.protagonist}-${inputs.tone}-${inputs.genre}`);
  const city = pick(["Rotterdam", "Prague", "Milan", "Brussels", "Helsinki", "Lisbon"], seed, 1);
  const title = `${pick(["After", "Glass", "Velvet", "Copper", "Hidden", "Quiet"], seed, 2)} ${pick(["Signal", "Harbor", "Index", "Crown", "Bridge", "Orbit"], seed, 3)}`;

  const seriesBible = `# ${title}\n\n## Core Premise\n${inputs.protagonist} navigates ${inputs.concept.toLowerCase()} in ${city}, where public narratives and private loyalties collide weekly.\n\n## Themes\n1) Trust is a strategy, not a feeling.\n2) Visibility has a cost.\n3) Growth requires public choices with private consequences.\n\n## Character Arcs\n- Lead: starts reactive, becomes strategic, ends accountable.\n- Rival: appears antagonistic, reveals aligned stakes.\n- Institutional force: protects stability over justice.\n\n## World Rules\n- Information moves faster than policy.\n- Reputation can open doors, but evidence keeps them open.\n- Every win creates a payable moral invoice in the next episode.`;

  const outline = `## 10-Episode Outline\n1. Cold open crisis and personal stake.\n2. False ally offers shortcut.\n3. Public mini-win, private trust fracture.\n4. Midpoint reveal of hidden agenda.\n5. Strategic failure in public.\n6. Recovery + relationship realignment.\n7. Counter-offensive with better evidence.\n8. Betrayal from inner circle.\n9. Last leverage and ticking clock.\n10. Decision that resolves now and seeds season two.`;

  const script = `## Episode Script (vertical beats)\n\nRain polished the tram rails into mirrors. ${inputs.protagonist} stood beneath a flickering sign and read the same message twice because disbelief bought ten extra seconds of denial.\n\n*If you want the truth, come alone.*\n\nThey walked anyway.\n\nThe underpass smelled of metal and wet concrete. Footsteps echoed from three directions and belonged to none. At the tunnel exit, a woman in charcoal slid a folder across a bench without making eye contact.\n\n"You're not in danger because you found this," she said. "You're in danger because someone expects you to ignore it."\n\nInside: invoices, signatures, one address that matched the lead's family block, and a timeline drawn in hurried handwriting. Action existed. Intent did not.\n\nBy noon, an unknown consultant offer appeared in the lead's inbox. By one, their office badge stopped opening doors. By two, their landlord announced "urgent structural maintenance."\n\nAt 18:00 they released one verified fragment, not the whole archive, forcing response without burning all leverage. Public reaction arrived in waves: disbelief, outrage, opportunism, help.\n\nAt 18:17, their closest ally arrived bleeding from one knuckle with a thumb drive and one sentence: "I got intent audio. We have one shot."\n\nThree precise knocks landed on the apartment door.\n\nNot loud. Not rushed. Professional.\n\nThe lock turned from the outside.`;

  const marketing = `## Marketing Copy\n**Blurb:** ${title} is a ${inputs.tone.toLowerCase()} ${inputs.genre.toLowerCase()} serial set in ${city}, where each episode turns one ethical decision into a public event.\n\n**Trailer line:** One file. One night. One chance to tell the truth before the story tells itself.\n\n**Tags:** #${inputs.genre.replace(/\s+/g, "")} #${inputs.tone.replace(/\s+/g, "")} #VerticalWebtoon #EUCreators #FastPass`;

  return {
    title,
    logline: `${inputs.protagonist} fights to protect what matters while exposing a system built to bury accountability.`,
    seriesBible,
    outline,
    script,
    marketing,
  };
}

export function AIStudioForm() {
  const [concept, setConcept] = useState("A civic producer uncovers a pattern of manipulated public records.");
  const [protagonist, setProtagonist] = useState("Mara, a multilingual producer");
  const [tone, setTone] = useState("Cinematic");
  const [genre, setGenre] = useState("Drama");
  const [tab, setTab] = useState<Tab>("Series Bible");
  const [output, setOutput] = useState<Output | null>(null);

  const joined = useMemo(() => {
    if (!output) return "";
    return `${output.title}\n\n${output.logline}\n\n${output.seriesBible}\n\n${output.outline}\n\n${output.script}\n\n${output.marketing}`;
  }, [output]);

  function run() {
    const next = generate({ concept, protagonist, tone, genre });
    setOutput(next);
    trackEvent("ai_studio_generate", { genre, tone });
  }

  function copy() {
    if (!joined) return;
    navigator.clipboard.writeText(joined);
    trackEvent("ai_studio_copy");
  }

  function download() {
    if (!joined || !output) return;
    const blob = new Blob([joined], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${output.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("ai_studio_download");
  }

  const visible = output
    ? tab === "Series Bible"
      ? output.seriesBible
      : tab === "Episode Outline"
        ? output.outline
        : tab === "Script"
          ? output.script
          : output.marketing
    : "Run generation to see output.";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className="section-shell">
        <h2 className="text-xl font-semibold">Try it now</h2>
        <p className="mt-2 text-sm text-slate-600">Deterministic generator mode gives consistent, long-form outputs without external APIs.</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-700">Concept
            <textarea value={concept} onChange={(e) => setConcept(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm" />
          </label>
          <label className="block text-sm font-medium text-slate-700">Protagonist
            <input value={protagonist} onChange={(e) => setProtagonist(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm font-medium text-slate-700">Tone
              <input value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm" />
            </label>
            <label className="text-sm font-medium text-slate-700">Genre
              <input value={genre} onChange={(e) => setGenre(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm" />
            </label>
          </div>
          <button className="cta-primary w-full" onClick={run}>Generate studio package</button>
        </div>
      </section>

      <section className="section-shell">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
              {item}
            </button>
          ))}
          <button className="cta-secondary ml-auto px-3 py-1.5 text-xs" onClick={copy}>Copy</button>
          <button className="cta-secondary px-3 py-1.5 text-xs" onClick={download}>Download .md</button>
        </div>
        <pre className="mt-4 max-h-[620px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{visible}</pre>
      </section>
    </div>
  );
}
