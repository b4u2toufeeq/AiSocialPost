import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { content, mediaUrls, scheduledFor, status } = body;

    const existing = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)))
      .then((r) => r[0]);

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existing.status === "published") {
      return NextResponse.json(
        { error: "Cannot edit a published post" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content;
    if (mediaUrls !== undefined) updateData.mediaUrls = mediaUrls;
    if (scheduledFor !== undefined) updateData.scheduledFor = new Date(scheduledFor);
    if (status !== undefined) updateData.status = status;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    return NextResponse.json({ post: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update post";
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)))
      .then((r) => r[0]);

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await db.delete(posts).where(eq(posts.id, id));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete post";
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
