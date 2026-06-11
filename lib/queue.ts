import { Queue } from "bullmq";
import { env } from "@/lib/env";

const globalForQueue = globalThis as unknown as {
  postSchedulerQueue: Queue | undefined;
};

export const postSchedulerQueue =
  globalForQueue.postSchedulerQueue ??
  new Queue("post-scheduler", {
    connection: {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForQueue.postSchedulerQueue = postSchedulerQueue;
}
export type PostJobPayload = {
  postId: string;
  platforms: string[];
};
