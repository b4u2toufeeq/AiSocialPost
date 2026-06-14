import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { posts, postTargets, socialAccounts } from "@/db/schema";
import { eq, inArray, and, gte, lte, count } from "drizzle-orm";
import { inngest } from "@/services/inngest";
import { publishPost } from "@/services/publisher";

const FREE_TIER_LIMIT = 10;

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, mediaUrls, scheduledFor, targetAccountIds } = body as {
      content: string;
      mediaUrls?: string[];
      scheduledFor?: string;
      targetAccountIds: string[];
    };

    if (!content || !targetAccountIds || targetAccountIds.length === 0) {
      return NextResponse.json(
        { error: "Content and at least one target account are required" },
        { status: 400 }
      );
    }

    // Plan limit check — count published + scheduled posts this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [usageResult] = await db
      .select({ value: count() })
      .from(posts)
      .where(
        and(
          eq(posts.userId, userId),
          inArray(posts.status, ["published", "publishing", "draft"]),
          gte(posts.createdAt, startOfMonth)
        )
      );
    const currentCount = usageResult?.value ?? 0;
    if (currentCount >= FREE_TIER_LIMIT) {
      return NextResponse.json(
        { error: `Free tier limit of ${FREE_TIER_LIMIT} posts per month reached. Upgrade to Pro for unlimited posting.` },
        { status: 403 }
      );
    }

    const scheduleDate = scheduledFor ? new Date(scheduledFor) : new Date();
    const isImmediate = !scheduledFor || scheduleDate <= now;

    const [post] = await db
      .insert(posts)
      .values({
        userId,
        content,
        mediaUrls: mediaUrls || [],
        scheduledFor: scheduleDate,
        status: isImmediate ? "publishing" : "draft",
      })
      .returning();

    const accounts = await db
      .select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, userId),
          inArray(socialAccounts.id, targetAccountIds.map((id) => id))
        )
      );

    for (const account of accounts) {
      await db.insert(postTargets).values({
        postId: post.id,
        socialAccountId: account.id,
        platform: account.platform,
      });
    }

    if (isImmediate) {
      await publishPost(post.id);
    } else {
      inngest.send({
        name: "post/publish",
        data: { postId: post.id },
        ts: scheduleDate.getTime(),
      }).catch(() => {
        console.warn("Inngest scheduling skipped (non-blocking)");
      });
    }

    const updated = await db
      .select()
      .from(posts)
      .where(eq(posts.id, post.id))
      .then((r) => r[0]);

    return NextResponse.json({ post: updated }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Number(searchParams.get("offset")) || 0;

    const conditions = [eq(posts.userId, userId)];

    if (status) {
      conditions.push(eq(posts.status, status));
    }

    if (from) {
      conditions.push(gte(posts.scheduledFor, new Date(from)));
    }

    if (to) {
      conditions.push(lte(posts.scheduledFor, new Date(to)));
    }

    const result = await db
      .select()
      .from(posts)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(posts.createdAt);

    const targets = await db
      .select()
      .from(postTargets)
      .where(
        inArray(
          postTargets.postId,
          result.map((p) => p.id)
        )
      );

    const targetMap = new Map<string, typeof targets>();
    for (const t of targets) {
      const arr = targetMap.get(t.postId) || [];
      arr.push(t);
      targetMap.set(t.postId, arr);
    }

    const postsWithTargets = result.map((post) => ({
      ...post,
      targets: targetMap.get(post.id) || [],
    }));

    return NextResponse.json({ posts: postsWithTargets });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list posts";
    console.error("List posts error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
