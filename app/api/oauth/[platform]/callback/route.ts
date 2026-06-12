import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { socialAccounts } from "@/db/schema";
import { resolveCredentials, getAdapter, type PlatformId } from "@/services/providers";
import { encrypt } from "@/lib/crypto";
import { env } from "@/lib/env";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/sign-in`, 302);
  }

  const { platform } = await params;
  const adapter = getAdapter(platform as PlatformId);
  if (!adapter) {
    return Response.redirect(
      `${env.NEXT_PUBLIC_BASE_URL}/accounts?error=${encodeURIComponent("Unknown platform")}`,
      302,
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    const errorMsg = searchParams.get("error_description") || error || "No authorization code received";
    return Response.redirect(
      `${env.NEXT_PUBLIC_BASE_URL}/accounts?error=${encodeURIComponent(errorMsg)}`,
      302,
    );
  }

  try {
    const redirectUri = `${env.NEXT_PUBLIC_BASE_URL}/api/oauth/${platform}/callback`;
    const { config, credentials } = await resolveCredentials(userId, platform as PlatformId);

    if (!credentials) {
      throw new Error(`No provider credentials found for ${platform}. Configure API credentials first.`);
    }

    // Use the stored redirect URI from the config if available
    const actualRedirectUri = config?.redirectUri || redirectUri;
    const tokenResult = await adapter.exchangeCode(code, { ...credentials, redirectUri: actualRedirectUri }, state || undefined);

    const encryptedAccess = encrypt(tokenResult.accessToken);
    const encryptedRefresh = tokenResult.refreshToken ? encrypt(tokenResult.refreshToken) : null;
    const providerConfigId = config?.id || null;

    // Check if account already exists for this user + platform + platform user
    const existing = await db
      .select({ id: socialAccounts.id })
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, platform),
          eq(socialAccounts.platformUserId, tokenResult.platformUserId),
        ),
      );

    if (existing.length > 0) {
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
          providerConfigId,
          status: "connected",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(socialAccounts.userId, userId),
            eq(socialAccounts.platform, platform),
            eq(socialAccounts.platformUserId, tokenResult.platformUserId),
          ),
        );
    } else {
      await db.insert(socialAccounts).values({
        userId,
        platform,
        platformUserId: tokenResult.platformUserId,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenSecret: tokenResult.tokenSecret,
        expiresAt: tokenResult.expiresAt,
        username: tokenResult.username,
        displayName: tokenResult.displayName,
        avatarUrl: tokenResult.avatarUrl,
        providerConfigId,
        status: "connected",
      });
    }

    return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/accounts?connected=${platform}`, 302);
  } catch (err) {
    console.error(`OAuth callback error for ${platform}:`, err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.redirect(
      `${env.NEXT_PUBLIC_BASE_URL}/accounts?error=${encodeURIComponent(message)}`,
      302,
    );
  }
}
