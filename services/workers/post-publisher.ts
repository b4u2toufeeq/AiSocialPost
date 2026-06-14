import { Worker } from "bullmq";
import { env } from "@/lib/env";
import { db } from "@/db";
import { posts, postTargets, postPlatformResults, socialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdapter, type PlatformId } from "@/services/providers";

interface PostJobData {
  postId: string;
}

let _worker: Worker<PostJobData> | null = null;

function ensureWorker(): Worker<PostJobData> | null {
  if (_worker) return _worker;
  try {
    _worker = new Worker<PostJobData>(
      "post-scheduler",
      async (job) => {
        const { postId } = job.data;
        console.log(`[Worker] Processing scheduled post: ${postId}`);

        const postRecord = await db.query.posts.findFirst({
          where: eq(posts.id, postId),
        });

        if (!postRecord) {
          throw new Error(`[Worker] Post not found: ${postId}`);
        }

        await db
          .update(posts)
          .set({ status: "publishing", updatedAt: new Date() })
          .where(eq(posts.id, postId));

        try {
          const targets = await db
            .select()
            .from(postTargets)
            .where(eq(postTargets.postId, postId));

          if (targets.length === 0) {
            throw new Error(`[Worker] No targets configured for post: ${postId}`);
          }

          let allSucceeded = true;

          for (const target of targets) {
            try {
              const account = await db.query.socialAccounts.findFirst({
                where: eq(socialAccounts.id, target.socialAccountId),
              });

              if (!account) {
                console.warn(`[Worker] Account ${target.socialAccountId} not found, skipping`);
                await db
                  .update(postTargets)
                  .set({ status: "failed", errorMessage: "Account not found" })
                  .where(eq(postTargets.id, target.id));
                allSucceeded = false;
                continue;
              }

              console.log(`[Worker] Publishing post ${postId} to ${account.platform} for account ${account.username}`);

              const adapter = getAdapter(account.platform as PlatformId);
              const decryptedToken = account.accessToken;

              let result: { externalPostId: string; publishedAt: Date; postUrl?: string };

              if (adapter.publish) {
                result = await adapter.publish({
                  content: postRecord.content,
                  mediaUrls: postRecord.mediaUrls as string[] | undefined,
                  accessToken: decryptedToken,
                });
              } else {
                console.warn(`[Worker] No publish adapter for ${account.platform}, skipping`);
                await db
                  .update(postTargets)
                  .set({ status: "failed", errorMessage: `Publishing not supported for ${account.platform}` })
                  .where(eq(postTargets.id, target.id));
                allSucceeded = false;
                continue;
              }

              await db.insert(postPlatformResults).values({
                postId: postRecord.id,
                socialAccountId: account.id,
                platform: account.platform,
                status: "success",
                externalPostId: result.externalPostId,
                publishedAt: result.publishedAt,
              });

              await db
                .update(postTargets)
                .set({ status: "success", externalPostId: result.externalPostId, publishedAt: result.publishedAt })
                .where(eq(postTargets.id, target.id));
            } catch (error: unknown) {
              allSucceeded = false;
              const msg = error instanceof Error ? error.message : "Unknown error occurred";
              console.error(`[Worker] Failed to publish to target ${target.platform}:`, error);

              await db.insert(postPlatformResults).values({
                postId: postRecord.id,
                socialAccountId: target.socialAccountId,
                platform: target.platform,
                status: "failed",
                errorMessage: msg,
              });

              await db
                .update(postTargets)
                .set({ status: "failed", errorMessage: msg })
                .where(eq(postTargets.id, target.id));
            }
          }

          await db
            .update(posts)
            .set({ status: allSucceeded ? "published" : "failed", updatedAt: new Date() })
            .where(eq(posts.id, postId));
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : "Unknown error occurred";
          console.error(`[Worker] Post publisher worker failed for post ${postId}:`, error);
          await db
            .update(posts)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(posts.id, postId));
          throw new Error(msg);
        }
      },
      {
        connection: {
          url: env.REDIS_URL,
          connectTimeout: 5000,
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 200, 2000)),
        },
        autorun: true,
      }
    );

    _worker.on("completed", (job) => {
      console.log(`[Worker] Job completed: ${job.id}`);
    });

    _worker.on("failed", (job, err) => {
      console.error(`[Worker] Job failed: ${job?.id}, error: ${err.message}`);
    });

    return _worker;
  } catch {
    console.warn("[Worker] Redis unavailable — publisher worker not started");
    return null;
  }
}

export function startPublisherWorker() {
  ensureWorker();
}
