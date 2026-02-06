import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/lookJob";
import { redis, redisKeys } from "@/lib/redis";
import { runLookJob } from "@/lib/runLookJob";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: { jobId: string } },
) {
  const jobId = params.jobId;
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { error: "job_not_found", jobId },
      { status: 404 },
    );
  }

  await updateJob(jobId, {
    status: "running",
    progress: 10,
    startedAt: job.startedAt ?? new Date().toISOString(),
  });

  await redis.lrem(redisKeys.queue, 0, jobId);

  try {
    const updated = await runLookJob(jobId);
    if (!updated) {
      return NextResponse.json(
        { error: "job_not_found", jobId },
        { status: 404 },
      );
    }

    return NextResponse.json({ status: updated.status, jobId });
  } catch (error) {
    await updateJob(jobId, {
      status: "failed",
      progress: 100,
      error: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json({ status: "failed", jobId }, { status: 500 });
  }
}
