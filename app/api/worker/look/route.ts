import { NextResponse } from "next/server";
import { redis, redisKeys } from "@/lib/redis";
import { runLookJob } from "@/lib/runLookJob";
import { updateJob } from "@/lib/lookJob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const jobIdFromBody = body?.jobId as string | undefined;
  const jobId =
    jobIdFromBody || (await redis.lpop<string>(redisKeys.queue));

  if (!jobId) {
    return NextResponse.json({ ok: true, status: "empty_queue" });
  }

  try {
    const updated = await runLookJob(jobId);
    if (!updated) {
      return NextResponse.json(
        { error: "job_not_found", jobId },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, status: updated.status, jobId });
  } catch (error) {
    await updateJob(jobId, {
      status: "failed",
      progress: 100,
      error: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json({ status: "failed", jobId }, { status: 500 });
  }
}
