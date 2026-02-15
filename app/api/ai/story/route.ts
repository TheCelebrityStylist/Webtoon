import { NextResponse } from "next/server";
import type { GeneratedSeriesPayload, Series } from "@/lib/types";

export const runtime = "nodejs";

type Inputs = {
  title?: string;
  genre: string;
  tone: string;
  setting: string;
  mainCharacter: string;
  coreConflict: string;
  targetLength: string;
  language: string;
  verticalPacing: boolean;
};

type RequestBody = {
  mode: "series+episode" | "outline";
  inputs: Inputs;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

function buildDemo(inputs: Inputs, mode: "series+episode" | "outline"): GeneratedSeriesPayload {
  const title = inputs.title?.trim() || `${inputs.tone} ${inputs.genre} Protocol`;
  const slug = slugify(title);
  const now = new Date().toISOString();

  const series: Series = {
    slug,
    title,
    logline: `${inputs.mainCharacter} faces ${inputs.coreConflict} in ${inputs.setting}.`,
    description: `A ${inputs.tone.toLowerCase()} ${inputs.genre.toLowerCase()} story engineered for vertical reading.`,
    longDescription: `Built by AI Studio demo mode: ${inputs.mainCharacter} navigates ${inputs.coreConflict} across ${inputs.setting} while each episode escalates stakes and emotional consequence.`,
    language: (inputs.language || "en").toLowerCase(),
    genres: [inputs.genre, "Drama"],
    tags: [inputs.tone, "Vertical", "AI Studio"],
    creatorName: "EU Webtoon Studio",
    coverAlt: `${title} cover`,
    coverUrl: "/covers/afterlight.svg",
    updatedAt: now,
    stats: { betaReads: 1200, betaRating: 4.5 },
    episodes: [
      {
        ep: 1,
        title: "Prototype Pilot",
        publishedAt: now,
        isFree: true,
        fastPass: false,
        readingTime: 8,
        excerpt: `${inputs.mainCharacter} takes one decision that cannot be undone.`,
        content: `${inputs.mainCharacter} arrives in ${inputs.setting} carrying a choice they can no longer postpone.\n\nThe conflict—${inputs.coreConflict}—appears manageable until one missing detail turns certainty into risk.\n\nBy the final beat, they act, and the cost of that action becomes the hook for episode two.`,
      },
    ],
  };

  const outline = Array.from({ length: 10 }, (_, i) => ({
    title: `Episode ${i + 1}: Act ${i + 1}`,
    summary: `${inputs.mainCharacter} gains leverage, loses comfort, and raises stakes in a ${inputs.tone.toLowerCase()} cadence.`,
  }));

  return {
    series,
    outline: mode === "outline" ? outline : undefined,
    storyBible: {
      themes: ["Agency", "Trust", "Consequence"],
      characterArcs: ["Reactive to strategic", "Isolated to collaborative"],
      worldRules: ["Information has value", "Public narrative shifts outcomes"],
      marketingCopy: {
        blurb: `${title} is a high-momentum vertical serial for readers who like emotional precision and sharp cliffhangers.`,
        trailerText: "One message. One night. One irreversible choice.",
        tags: ["#Vertical", "#EUWebtoon", "#FastPass"],
      },
    },
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  if (!body?.inputs) {
    return NextResponse.json({ error: "invalid_inputs" }, { status: 400 });
  }

  return NextResponse.json(buildDemo(body.inputs, body.mode));
}
