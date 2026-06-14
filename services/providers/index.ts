import { env } from "@/lib/env";
import { decrypt } from "@/lib/crypto";
import { db } from "@/db";
import { socialProviderConfigs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type {
  SocialProviderAdapter,
  ProviderCredentials,
  ProviderConfig,
  PlatformId,
} from "./types";
import { instagram, facebook, threads } from "./meta";
import { youtube } from "./google";
import { twitter } from "./twitter";
import { linkedin } from "./linkedin";
import { tiktok } from "./tiktok";
import { pinterest } from "./pinterest";
import { discord } from "./discord";
import { slack } from "./slack";
import { telegram } from "./telegram";

export type { PlatformId, ProviderConfig, ProviderCredentials, OAuthTokenResult, ConnectedAccount, PublishParams, PublishResult } from "./types";

export const platformAdapters: Record<PlatformId, SocialProviderAdapter> = {
  instagram,
  facebook,
  threads,
  twitter,
  linkedin,
  youtube,
  tiktok,
  pinterest,
  discord,
  slack,
  telegram,
};

export const PLATFORM_META: Record<PlatformId, { name: string; color: string; icon: string }> = {
  instagram: { name: "Instagram", color: "#E4405F", icon: "InstagramIcon" },
  facebook: { name: "Facebook", color: "#1877F2", icon: "Facebook01Icon" },
  threads: { name: "Threads", color: "#000000", icon: "ThreadsIcon" },
  twitter: { name: "Twitter / X", color: "#000000", icon: "NewTwitterIcon" },
  linkedin: { name: "LinkedIn", color: "#0A66C2", icon: "Linkedin01Icon" },
  youtube: { name: "YouTube", color: "#FF0000", icon: "YoutubeIcon" },
  tiktok: { name: "TikTok", color: "#000000", icon: "TiktokIcon" },
  pinterest: { name: "Pinterest", color: "#BD081C", icon: "PinterestIcon" },
  telegram: { name: "Telegram", color: "#26A5E4", icon: "TelegramIcon" },
  discord: { name: "Discord", color: "#5865F2", icon: "DiscordIcon" },
  slack: { name: "Slack", color: "#4A154B", icon: "SlackIcon" },
};

// System-level credentials from env vars
function getSystemCredentials(platform: PlatformId): ProviderCredentials | null {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const map: Record<PlatformId, { clientId: string; clientSecret: string; scopes: string[] } | null> = {
    instagram: env.META_APP_ID ? { clientId: env.META_APP_ID, clientSecret: env.META_APP_SECRET, scopes: ["instagram_basic", "instagram_content_publish", "pages_read_engagement"] } : null,
    facebook: env.META_APP_ID ? { clientId: env.META_APP_ID, clientSecret: env.META_APP_SECRET, scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"] } : null,
    threads: env.META_APP_ID ? { clientId: env.META_APP_ID, clientSecret: env.META_APP_SECRET, scopes: ["threads_basic", "threads_content_publish"] } : null,
    twitter: env.TWITTER_CLIENT_ID ? { clientId: env.TWITTER_CLIENT_ID, clientSecret: env.TWITTER_CLIENT_SECRET, scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"] } : null,
    linkedin: env.LINKEDIN_CLIENT_ID ? { clientId: env.LINKEDIN_CLIENT_ID, clientSecret: env.LINKEDIN_CLIENT_SECRET, scopes: ["openid", "profile", "email"] } : null,
    youtube: env.GOOGLE_CLIENT_ID ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, scopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/userinfo.profile"] } : null,
    tiktok: env.TIKTOK_CLIENT_KEY ? { clientId: env.TIKTOK_CLIENT_KEY, clientSecret: env.TIKTOK_CLIENT_SECRET, scopes: ["user.info.basic", "video.publish", "video.upload"] } : null,
    pinterest: env.PINTEREST_CLIENT_ID ? { clientId: env.PINTEREST_CLIENT_ID, clientSecret: env.PINTEREST_CLIENT_SECRET, scopes: ["boards:read", "boards:write", "pins:read", "pins:write", "user_accounts:read"] } : null,
    discord: env.DISCORD_CLIENT_ID ? { clientId: env.DISCORD_CLIENT_ID, clientSecret: env.DISCORD_CLIENT_SECRET, scopes: ["identify", "guilds", "bot"] } : null,
    slack: env.SLACK_CLIENT_ID ? { clientId: env.SLACK_CLIENT_ID, clientSecret: env.SLACK_CLIENT_SECRET, scopes: ["channels:read", "chat:write", "files:write", "users:read"] } : null,
    telegram: { clientId: "", clientSecret: "", scopes: [] },
  };
  const entry = map[platform];
  if (!entry) return null;
  return {
    clientId: entry.clientId,
    clientSecret: entry.clientSecret,
    redirectUri: `${baseUrl}/api/oauth/${platform}/callback`,
    scopes: entry.scopes,
  };
}

/**
 * Resolve provider credentials for a tenant.
 * Priority: custom DB config > system env config > null
 */
export async function resolveCredentials(tenantId: string, platform: PlatformId): Promise<{ config: ProviderConfig | null; credentials: ProviderCredentials | null }> {
  const dbConfig = await db
    .select()
    .from(socialProviderConfigs)
    .where(
      and(
        eq(socialProviderConfigs.tenantId, tenantId),
        eq(socialProviderConfigs.platform, platform),
        eq(socialProviderConfigs.isActive, true),
      ),
    )
    .then((rows) => rows[0] || null);

  if (dbConfig) {
    const clientSecret = decrypt(dbConfig.clientSecretEncrypted);
    return {
      config: {
        id: dbConfig.id,
        platform: dbConfig.platform as PlatformId,
        providerType: dbConfig.providerType as "system" | "custom",
        clientId: dbConfig.clientId,
        redirectUri: dbConfig.redirectUri,
        scopes: dbConfig.scopes,
        isActive: dbConfig.isActive,
        createdAt: dbConfig.createdAt.toISOString(),
      },
      credentials: {
        clientId: dbConfig.clientId,
        clientSecret,
        redirectUri: dbConfig.redirectUri,
        scopes: dbConfig.scopes,
      },
    };
  }

  // Fallback to system credentials
  const system = getSystemCredentials(platform);
  if (system) {
    return {
      config: null,
      credentials: system,
    };
  }

  return { config: null, credentials: null };
}

export function getAdapter(platform: PlatformId): SocialProviderAdapter {
  const adapter = platformAdapters[platform];
  if (!adapter) throw new Error(`Unknown platform: ${platform}`);
  return adapter;
}
