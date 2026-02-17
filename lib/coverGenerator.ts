import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function coverPathForSlug(slug: string): string {
  return path.join(process.cwd(), "public", "covers", `${slug}.webp`);
}

export function coverPublicUrl(slug: string): string {
  return `/covers/${slug}.webp`;
}

export function coverExists(slug: string): boolean {
  return existsSync(coverPathForSlug(slug));
}

export async function generateCoverImage(params: {
  title: string;
  genre: string;
  tone: string;
  setting: string;
  tagline: string;
  slug?: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("missing_openai_api_key");
  }

  const slug = params.slug ?? slugify(params.title);
  const outPath = coverPathForSlug(slug);
  const prompt = `Premium cinematic vertical illustration for a European webtoon cover.
Story title: ${params.title}
Genre: ${params.genre}
Tone: ${params.tone}
Setting: ${params.setting}
Style: clean anime-inspired semi-realistic, dramatic lighting, bold silhouette composition, poster-ready, mobile-first vertical format.
No text in image.
Focus on a strong protagonist moment that implies high stakes.
Tagline context: ${params.tagline}`;

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1536",
      output_format: "webp",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`cover_generation_failed:${response.status}:${text}`);
  }

  const payload = (await response.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = payload.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("cover_generation_missing_data");
  }

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, Buffer.from(b64, "base64"));

  return { slug, path: outPath, publicUrl: coverPublicUrl(slug) };
}
