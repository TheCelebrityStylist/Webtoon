import { NextResponse } from "next/server";
import { addGeneratedSeries } from "@/lib/generatedStore";
import type { Series } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { series?: Series };
  if (!body.series) {
    return NextResponse.json({ error: "missing_series" }, { status: 400 });
  }

  const result = await addGeneratedSeries(body.series);
  return NextResponse.json({ stored: result.stored });
}
