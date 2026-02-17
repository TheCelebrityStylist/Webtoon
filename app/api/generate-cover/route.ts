import { NextResponse } from "next/server";
import { coverExists, coverPublicUrl, generateCoverImage } from "@/lib/coverGenerator";

export const runtime = "nodejs";

type Body = {
  title?: string;
  genre?: string;
  tone?: string;
  setting?: string;
  tagline?: string;
  slug?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const title = body.title?.trim();
  const genre = body.genre?.trim();
  const tone = body.tone?.trim();
  const setting = body.setting?.trim();
  const tagline = body.tagline?.trim();

  if (!title || !genre || !tone || !setting || !tagline) {
    return NextResponse.json({ error: "invalid_inputs" }, { status: 400 });
  }

  try {
    const result = await generateCoverImage({ title, genre, tone, setting, tagline, slug: body.slug });
    return NextResponse.json({ ok: true, coverUrl: result.publicUrl, slug: result.slug });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  return NextResponse.json({ exists: coverExists(slug), coverUrl: coverPublicUrl(slug) });
}
