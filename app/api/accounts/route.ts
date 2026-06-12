import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { socialAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await db
    .select({
      id: socialAccounts.id,
      platform: socialAccounts.platform,
      platformUserId: socialAccounts.platformUserId,
      username: socialAccounts.username,
      displayName: socialAccounts.displayName,
      avatarUrl: socialAccounts.avatarUrl,
      expiresAt: socialAccounts.expiresAt,
      createdAt: socialAccounts.createdAt,
    })
    .from(socialAccounts)
    .where(eq(socialAccounts.userId, userId));

  return Response.json({ accounts });
}
