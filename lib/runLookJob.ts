import { getJob, updateJob } from "@/lib/lookJob";
import { sourceProducts } from "@/lib/sourcing";
import { summaryLine } from "@/lib/stylistCopy";

export async function runLookJob(jobId: string) {
  const job = await getJob(jobId);
  if (!job) return null;

  if (job.status === "completed" || job.status === "running") {
    return job;
  }

  await updateJob(jobId, {
    status: "running",
    progress: 15,
    startedAt: new Date().toISOString(),
  });

  const { productsBySlot, items, total } = await sourceProducts(job.input.prompt);

  const result = {
    summary: summaryLine(total, job.input.currency),
    total,
    items,
  };

  return await updateJob(jobId, {
    status: "completed",
    progress: 100,
    productsBySlot,
    result,
  });
}
