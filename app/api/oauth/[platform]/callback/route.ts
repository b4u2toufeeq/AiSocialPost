import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { socialAccounts } from "@/db/schema";
import { PLATFORMS, type PlatformId } from "@/services/oauth";
import { encrypt } from "@/lib/crypto";
import { env } from "@/lib/env";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { platform } = await params;
  const config = PLATFORMS.find((p) => p.id === platform);
  if (!config) {
    return new Response(`Unknown platform: ${platform}`, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    const errorMsg = searchParams.get("error_description") || error || "No authorization code received";
    return new Response(`OAuth error: ${errorMsg}`, { status: 400 });
  }

  try {
    const redirectUri = `${env.NEXT_PUBLIC_BASE_URL}/api/oauth/${platform}/callback`;
    const tokenResult = await config.exchangeCode(code, redirectUri);

    const encryptedAccess = encrypt(tokenResult.accessToken);
    const encryptedRefresh = tokenResult.refreshToken ? encrypt(tokenResult.refreshToken) : null;

    // Check if account already exists for this platform user
    const existing = await db
      .select({ id: socialAccounts.id })
      .from(socialAccounts)
      .where(eq(socialAccounts.platformUserId, tokenResult.platformUserId));

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(socialAccounts)
        .set({
          accessToken: encryptedAccess,
          refreshToken: encryptedRefresh,
          tokenSecret: tokenResult.tokenSecret,
          expiresAt: tokenResult.expiresAt,
          username: tokenResult.username,
          displayName: tokenResult.displayName,
          avatarUrl: tokenResult.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(socialAccounts.platformUserId, tokenResult.platformUserId));
    } else {
      // Insert new record
      await db.insert(socialAccounts).values({
        userId,
        platform: config.id,
        platformUserId: tokenResult.platformUserId,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenSecret: tokenResult.tokenSecret,
        expiresAt: tokenResult.expiresAt,
        username: tokenResult.username,
        displayName: tokenResult.displayName,
        avatarUrl: tokenResult.avatarUrl,
      });
    }

    // Redirect back to accounts page with success
    return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/accounts?connected=${platform}`, 302);
  } catch (err) {
    console.error(`OAuth callback error for ${platform}:`, err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/accounts?error=${encodeURIComponent(message)}`, 302);
  }
}
