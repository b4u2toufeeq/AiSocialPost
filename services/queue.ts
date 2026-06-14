import { Queue } from "bullmq";
import { env } from "@/lib/env";

let _queue: Queue | null = null;

function getQueue(): Queue | null {
  if (_queue) return _queue;
  try {
    _queue = new Queue("post-scheduler", {
      connection: {
        url: env.REDIS_URL,
        connectTimeout: 5000,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
      },
    });
    return _queue;
  } catch {
    console.warn("[Queue] Redis unavailable — running without job queue");
    return null;
  }
}

export async function enqueuePostJob(
  postId: string,
  platforms: string[],
  opts?: { delay?: number }
) {
  const q = getQueue();
  if (!q) {
    console.warn("[Queue] Skipping enqueue — no Redis connection");
    return;
  }
  await q.add(
    "publish-post",
    { postId, platforms },
    { removeOnComplete: true, removeOnFail: 100, ...opts }
  );
}

export type PostJobPayload = {
  postId: string;
  platforms: string[];
};
