import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `You are a premium webtoon story generator. Return JSON only. Use short paragraphs, cliffhanger endings, and cinematic pacing.`;

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

function demoResponse(inputs: Inputs, mode: "series+episode" | "outline") {
  const title = inputs.title?.trim() || `${inputs.tone} ${inputs.genre} Dreams`;
  const slug = slugify(title);
  const description = `A ${inputs.tone.toLowerCase()} ${inputs.genre.toLowerCase()} saga set in ${inputs.setting}.`;
  const logline = `${inputs.mainCharacter} faces ${inputs.coreConflict} in ${inputs.setting}.`;
  const creatorName = "EU Webtoon Studio";
  const episodeContent = `The city wakes with a hush, the kind that only arrives when something has already changed. ${inputs.mainCharacter} stands at the edge of ${inputs.setting}, feeling the pull of ${inputs.coreConflict}.

Every breath is a decision. Every decision bends the day in a new direction. The streets carry whispers, and a promise that if ${inputs.mainCharacter} takes one more step, nothing will ever be the same again.

They take that step. The ground shifts under them, and the world answers with a secret it has been hiding for years. The air grows colder. The lights along the street flicker once, twice, and then settle into a new pattern.

By nightfall, the truth arrives like a tide. The story breaks open. The cliff is close. And just before the leap, a voice calls their name. They turn. The city turns with them.

The last line of the day is a promise: tomorrow will not be the same.`;

  const series = {
    slug,
    title,
    logline,
    description,
    language: inputs.language.toLowerCase(),
    genres: [inputs.genre, inputs.tone],
    creatorName,
    coverAlt: `${title} cover art`,
    coverUrl: "/og?series=" + slug,
    updatedAt: new Date().toISOString(),
    episodes: [
      {
        ep: 1,
        title: "The First Step",
        isFree: true,
        publishedAt: new Date().toISOString(),
        excerpt: logline,
        content: episodeContent,
      },
    ],
  };

  const outline = Array.from({ length: 10 }).map((_, i) => ({
    title: `Episode ${i + 1}: ${title} — Act ${i + 1}`,
    summary: `A turning point where ${inputs.mainCharacter} learns a new piece of the truth and the stakes rise.`,
  }));

  return { series, outline: mode === "outline" ? outline : undefined };
}

async function openAIResponse(inputs: Inputs, mode: "series+episode" | "outline") {
  const prompt = {
    role: "user",
    content: `Generate a JSON object with keys: series, outline (optional).\nSeries fields: title, slug_suggestion, logline, description, creator_name, genres (array), language, episode (object with ep, title, excerpt, content).\nEpisode content should be a full webtoon-style episode with cliffhanger ending.\nInputs: ${JSON.stringify(inputs)}\nMode: ${mode}`,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, prompt],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed");
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";
  const parsed = JSON.parse(raw);

  const series = {
    slug: slugify(parsed.series?.slug_suggestion || parsed.series?.title || inputs.title || "series"),
    title: parsed.series?.title || inputs.title || "Untitled Series",
    logline: parsed.series?.logline || "",
    description: parsed.series?.description || "",
    language: (parsed.series?.language || inputs.language || "en").toLowerCase(),
    genres: parsed.series?.genres || [inputs.genre],
    creatorName: parsed.series?.creator_name || "EU Webtoon Studio",
    coverAlt: `${parsed.series?.title || inputs.title || "Series"} cover art`,
    coverUrl: "/og?series=" + slugify(parsed.series?.title || inputs.title || "series"),
    updatedAt: new Date().toISOString(),
    episodes: [
      {
        ep: 1,
        title: parsed.series?.episode?.title || "Episode 1",
        isFree: true,
        publishedAt: new Date().toISOString(),
        excerpt: parsed.series?.episode?.excerpt || parsed.series?.logline || "",
        content: parsed.series?.episode?.content || "",
      },
    ],
  };

  const outline = parsed.outline?.map((item: { title: string; summary: string }) => ({
    title: item.title,
    summary: item.summary,
  }));

  return { series, outline: mode === "outline" ? outline : undefined };
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const { inputs, mode } = body;

  if (!inputs) {
    return NextResponse.json({ error: "invalid_inputs" }, { status: 400 });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(demoResponse(inputs, mode));
    }

    const result = await openAIResponse(inputs, mode);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
