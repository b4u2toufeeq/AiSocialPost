import { Worker } from "bullmq";
import { env } from "@/lib/env";
import { db } from "@/db";
import { posts, postPlatformResults, socialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PostJobData {
  postId: string;
}

const globalForWorker = globalThis as unknown as {
  postPublisherWorker: Worker<PostJobData> | undefined;
};

export const postPublisherWorker =
  globalForWorker.postPublisherWorker ??
  new Worker<PostJobData>(
    "post-scheduler",
    async (job) => {
      const { postId } = job.data;
      console.log(`[Worker] Processing scheduled post: ${postId}`);

      // 1. Fetch post detail from database
      const postRecord = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
      });

      if (!postRecord) {
        throw new Error(`[Worker] Post not found: ${postId}`);
      }

      // Update post status to publishing
      await db
        .update(posts)
        .set({ status: "publishing", updatedAt: new Date() })
        .where(eq(posts.id, postId));

      try {
        // 2. Fetch linked social accounts for the user
        const accounts = await db.query.socialAccounts.findMany({
          where: eq(socialAccounts.userId, postRecord.userId),
        });

        if (accounts.length === 0) {
          throw new Error(`[Worker] No social accounts connected for user: ${postRecord.userId}`);
        }

        let allSucceeded = true;

        // 3. Publish to each platform account
        for (const account of accounts) {
          try {
            console.log(`[Worker] Simulating publication of post ${postId} to ${account.platform} for account ${account.username}`);
            
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mock success
            const externalPostId = `mock_${account.platform}_${Math.random().toString(36).substring(2, 11)}`;

            await db.insert(postPlatformResults).values({
              postId: postRecord.id,
              socialAccountId: account.id,
              platform: account.platform,
              status: "success",
              externalPostId,
              publishedAt: new Date(),
            });
          } catch (error: any) {
            allSucceeded = false;
            console.error(`[Worker] Failed to publish to ${account.platform}:`, error);

            await db.insert(postPlatformResults).values({
              postId: postRecord.id,
              socialAccountId: account.id,
              platform: account.platform,
              status: "failed",
              errorMessage: error.message || "Unknown error occurred",
            });
          }
        }

        // Update parent post status
        await db
          .update(posts)
          .set({ status: allSucceeded ? "published" : "failed", updatedAt: new Date() })
          .where(eq(posts.id, postId));

      } catch (error: any) {
        console.error(`[Worker] Post publisher worker failed for post ${postId}:`, error);
        await db
          .update(posts)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(posts.id, postId));
        throw error;
      }
    },
    {
      connection: {
        url: env.REDIS_URL,
        maxRetriesPerRequest: null,
      },
      autorun: true,
    }
  );

if (process.env.NODE_ENV !== "production") {
  globalForWorker.postPublisherWorker = postPublisherWorker;
}

postPublisherWorker.on("completed", (job) => {
  console.log(`[Worker] Job completed: ${job.id}`);
});

postPublisherWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job failed: ${job?.id}, error: ${err.message}`);
});
