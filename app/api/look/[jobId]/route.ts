import { NextResponse } from "next/server";
import { getJob } from "@/lib/lookJob";

export const runtime = "nodejs";

export async function GET(
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

  return NextResponse.json({
    status: job.status,
    jobId: job.jobId,
    progress: job.progress,
    productsBySlot: job.productsBySlot,
    result: job.result,
    updatedAt: job.updatedAt,
    startedAt: job.startedAt,
  });
}
