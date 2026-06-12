import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { socialAccounts, socialProviderConfigs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PLATFORM_META, type PlatformId } from "@/services/providers";

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
      status: socialAccounts.status,
      createdAt: socialAccounts.createdAt,
      providerConfigId: socialAccounts.providerConfigId,
    })
    .from(socialAccounts)
    .where(eq(socialAccounts.userId, userId));

  // Get provider config status for each platform
  const configs = await db
    .select({
      platform: socialProviderConfigs.platform,
      providerType: socialProviderConfigs.providerType,
      id: socialProviderConfigs.id,
    })
    .from(socialProviderConfigs)
    .where(
      and(
        eq(socialProviderConfigs.tenantId, userId),
        eq(socialProviderConfigs.isActive, true),
      ),
    );

  const configMap = new Map(configs.map((c) => [c.platform, c]));

  // Build per-platform status
  const platforms = (Object.keys(PLATFORM_META) as PlatformId[]).map((id) => {
    const meta = PLATFORM_META[id];
    const hasCustomConfig = configMap.has(id);
    const hasSystemConfig = false; // resolved at connect time
    const connected = accounts.filter((a) => a.platform === id);
    return {
      id,
      name: meta.name,
      color: meta.color,
      icon: meta.icon,
      configStatus: hasCustomConfig ? "custom" : ("unknown" as "custom" | "system" | "none"),
      configId: configMap.get(id)?.id || null,
      providerType: configMap.get(id)?.providerType || null,
      connected,
    };
  });

  return Response.json({ accounts, platforms });
}
