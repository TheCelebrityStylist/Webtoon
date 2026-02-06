import { NextResponse } from "next/server";
import { createJob } from "@/lib/lookJob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const budget = Number.isFinite(body?.budget) ? Number(body.budget) : null;
    const currency = typeof body?.currency === "string" ? body.currency : "EUR";

    if (!prompt || prompt.length < 6) {
      return NextResponse.json(
        { error: "invalid_prompt" },
        { status: 400 },
      );
    }

    const job = await createJob({ prompt, budget, currency });

    return NextResponse.json({ jobId: job.jobId });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
