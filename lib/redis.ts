import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const redisKeys = {
  job: (jobId: string) => `lookjob:${jobId}`,
  queue: "lookjob:queue",
};
