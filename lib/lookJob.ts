import { redis, redisKeys } from "@/lib/redis";

export type LookJobStatus = "queued" | "running" | "completed" | "failed";

export type LookProduct = {
  retailer: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  url: string;
};

export type LookJob = {
  jobId: string;
  status: LookJobStatus;
  progress: number;
  productsBySlot: Record<string, LookProduct[]>;
  result: {
    summary: string;
    total: number;
    items: LookProduct[];
  } | null;
  updatedAt: string;
  startedAt: string | null;
  input: {
    prompt: string;
    budget: number | null;
    currency: string;
  };
  error?: string;
};

export async function createJob(input: LookJob["input"]): Promise<LookJob> {
  const now = new Date().toISOString();
  const jobId = crypto.randomUUID();
  const job: LookJob = {
    jobId,
    status: "queued",
    progress: 0,
    productsBySlot: {},
    result: null,
    updatedAt: now,
    startedAt: null,
    input,
  };

  await redis.set(redisKeys.job(jobId), job);
  await redis.rpush(redisKeys.queue, jobId);

  return job;
}

export async function getJob(jobId: string): Promise<LookJob | null> {
  const job = await redis.get<LookJob>(redisKeys.job(jobId));
  return job ?? null;
}

export async function updateJob(jobId: string, patch: Partial<LookJob>) {
  const current = await getJob(jobId);
  if (!current) return null;

  const updated: LookJob = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(redisKeys.job(jobId), updated);
  return updated;
}
