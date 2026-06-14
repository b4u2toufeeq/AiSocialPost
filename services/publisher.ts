import { db } from "@/db";
import { posts, postTargets, postPlatformResults, socialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdapter, type PlatformId } from "@/services/providers";

export async function publishPost(postId: string): Promise<{ allSucceeded: boolean }> {
  const postRecord = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!postRecord) {
    throw new Error(`Post not found: ${postId}`);
  }

  await db
    .update(posts)
    .set({ status: "publishing", updatedAt: new Date() })
    .where(eq(posts.id, postId));

  const targets = await db
    .select()
    .from(postTargets)
    .where(eq(postTargets.postId, postId));

  if (targets.length === 0) {
    throw new Error(`No targets configured for post: ${postId}`);
  }

  let allSucceeded = true;

  for (const target of targets) {
    try {
      const account = await db.query.socialAccounts.findFirst({
        where: eq(socialAccounts.id, target.socialAccountId),
      });

      if (!account) {
        console.warn(`Account ${target.socialAccountId} not found, skipping`);
        await db
          .update(postTargets)
          .set({ status: "failed", errorMessage: "Account not found" })
          .where(eq(postTargets.id, target.id));
        allSucceeded = false;
        continue;
      }

      console.log(`Publishing post ${postId} to ${account.platform} for account ${account.username}`);

      const adapter = getAdapter(account.platform as PlatformId);

      if (!adapter.publish) {
        console.warn(`No publish adapter for ${account.platform}, skipping`);
        await db
          .update(postTargets)
          .set({ status: "failed", errorMessage: `Publishing not supported for ${account.platform}` })
          .where(eq(postTargets.id, target.id));
        allSucceeded = false;
        continue;
      }

      const result = await adapter.publish({
        content: postRecord.content,
        mediaUrls: postRecord.mediaUrls as string[] | undefined,
        accessToken: account.accessToken,
      });

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
      console.error(`Failed to publish to target ${target.platform}:`, error);

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

  return { allSucceeded };
}
