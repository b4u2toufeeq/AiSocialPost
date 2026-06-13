import { env } from "@/lib/env";
import crypto from "crypto";

export type PlatformId =
  | "instagram"
  | "facebook"
  | "threads"
  | "twitter"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "telegram"
  | "discord"
  | "slack";

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  color: string;
  icon: string;
  authMethod: "OAuth 2.0" | "OAuth 2.0 PKCE" | "Meta OAuth 2.0" | "Google OAuth 2.0" | "Bot Token" | "Slack OAuth 2.0" | "TikTok OAuth 2.0" | "Bot Token / OAuth";
  connectUrl: (redirectUri: string, state: string) => string;
  exchangeCode: (code: string, redirectUri: string, codeVerifier?: string) => Promise<OAuthTokenResult>;
  refreshToken?: (refreshToken: string) => Promise<OAuthTokenResult>;
}

export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  tokenSecret?: string;
  expiresAt?: Date;
  platformUserId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export const PLATFORM_ICONS: Record<PlatformId, string> = {
  instagram: "InstagramIcon",
  facebook: "Facebook01Icon",
  threads: "ThreadsIcon",
  twitter: "NewTwitterIcon",
  linkedin: "Linkedin01Icon",
  youtube: "YoutubeIcon",
  tiktok: "TiktokIcon",
  pinterest: "PinterestIcon",
  telegram: "TelegramIcon",
  discord: "DiscordIcon",
  slack: "SlackIcon",
};

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "instagram",
    name: "Instagram",
    color: "#E4405F",
    icon: "InstagramIcon",
    authMethod: "Meta OAuth 2.0",
    connectUrl: (redirectUri, state) =>
      `https://www.facebook.com/v19.0/dialog/oauth?client_id=${env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=instagram_basic,instagram_content_publish,pages_read_engagement`,
    exchangeCode: async (code, redirectUri) => {
      const resp = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          redirect_uri: redirectUri,
          code,
        }),
      });
      return parseMetaTokenResponse(resp);
    },
    refreshToken: async (token) => {
      const resp = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${env.META_APP_ID}&client_secret=${env.META_APP_SECRET}&fb_exchange_token=${token}`);
      return parseMetaTokenResponse(resp);
    },
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
    icon: "Facebook01Icon",
    authMethod: "Meta OAuth 2.0",
    connectUrl: (redirectUri, state) =>
      `https://www.facebook.com/v19.0/dialog/oauth?client_id=${env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=pages_manage_posts,pages_read_engagement,pages_show_list`,
    exchangeCode: async (code, redirectUri) => {
      const resp = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          redirect_uri: redirectUri,
          code,
        }),
      });
      return parseMetaTokenResponse(resp);
    },
    refreshToken: async (token) => {
      const resp = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${env.META_APP_ID}&client_secret=${env.META_APP_SECRET}&fb_exchange_token=${token}`);
      return parseMetaTokenResponse(resp);
    },
  },
  {
    id: "threads",
    name: "Threads",
    color: "#000000",
    icon: "ThreadsIcon",
    authMethod: "Meta OAuth 2.0",
    connectUrl: (redirectUri, state) =>
      `https://www.facebook.com/v19.0/dialog/oauth?client_id=${env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=threads_basic,threads_content_publish`,
    exchangeCode: async (code, redirectUri) => {
      const resp = await fetch("https://graph.threads.net/v19.0/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.META_APP_ID,
          client_secret: env.META_APP_SECRET,
          redirect_uri: redirectUri,
          code,
        }),
      });
      return parseMetaTokenResponse(resp);
    },
  },
  {
    id: "twitter",
    name: "Twitter / X",
    color: "#000000",
    icon: "NewTwitterIcon",
    authMethod: "OAuth 2.0 PKCE",
    connectUrl: (redirectUri, state) => {
      const codeVerifier = crypto.randomBytes(32).toString("base64url");
      const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
      const compositeState = `${state}.${codeVerifier}`;
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read+tweet.write+users.read+offline.access&state=${compositeState}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    },
    exchangeCode: async (code, redirectUri, codeVerifier) => {
      const actualVerifier = codeVerifier ? codeVerifier.split(".").slice(1).join(".") : code;
      const basic = Buffer.from(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`).toString("base64");
      const resp = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basic}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: actualVerifier,
        }),
      });
      return parseTwitterTokenResponse(resp);
    },
    refreshToken: async (token) => {
      const basic = Buffer.from(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`).toString("base64");
      const resp = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basic}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: token,
        }),
      });
      return parseTwitterTokenResponse(resp);
    },
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    icon: "Linkedin01Icon",
    authMethod: "OAuth 2.0",
    connectUrl: (redirectUri, state) =>
      `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=openid+profile+email`,
    exchangeCode: async (code, redirectUri) => {
      const resp = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
        }),
      });
      return parseLinkedInTokenResponse(resp);
    },
    refreshToken: async (token) => {
      const resp = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: token,
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
        }),
      });
      return parseLinkedInTokenResponse(resp);
    },
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    icon: "YoutubeIcon",
    authMethod: "Google OAuth 2.0",
    connectUrl: (redirectUri, state) =>
      `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=https://www.googleapis.com/auth/youtube.upload+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/userinfo.profile&access_type=offline&prompt=consent`,
    exchangeCode: async (code, redirectUri) => {
      const resp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
        }),
      });
      return parseGoogleTokenResponse(resp);
    },
    refreshToken: async (token) => {
      const resp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: token,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
        }),
      });
      return parseGoogleTokenResponse(resp);
    },
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "#000000",
    icon: "TiktokIcon",
    authMethod: "TikTok OAuth 2.0",
    connectUrl: (redirectUri, state) =>
      `https://www.tiktok.com/v2/auth/authorize?client_key=${env.TIKTOK_CLIENT_KEY}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=user.info.basic,video.publish,video.upload`,
    exchangeCode: async (code, redirectUri) => {
      const resp = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
        body: new URLSearchParams({
          client_key: env.TIKTOK_CLIENT_KEY,
          client_secret: env.TIKTOK_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
      return parseTikTokTokenResponse(resp);
    },
    refreshToken: async (token) => {
      const resp = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: env.TIKTOK_CLIENT_KEY,
          client_secret: env.TIKTOK_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: token,
        }),
      });
      return parseTikTokTokenResponse(resp);
    },
  },
  {
    id: "pinterest",
    name: "Pinterest",
    color: "#BD081C",
    icon: "PinterestIcon",
    authMethod: "OAuth 2.0",
    connectUrl: (redirectUri, state) =>
      `https://www.pinterest.com/oauth/?client_id=${env.PINTEREST_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read`,
    exchangeCode: async (code, redirectUri) => {
      const resp = await fetch("https://api.pinterest.com/v5/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${env.PINTEREST_CLIENT_ID}:${env.PINTEREST_CLIENT_SECRET}`).toString("base64")}` },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
      return parsePinterestTokenResponse(resp);
    },
    refreshToken: async (token) => {
      const resp = await fetch("https://api.pinterest.com/v5/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${env.PINTEREST_CLIENT_ID}:${env.PINTEREST_CLIENT_SECRET}`).toString("base64")}` },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: token,
        }),
      });
      return parsePinterestTokenResponse(resp);
    },
  },
  {
    id: "telegram",
    name: "Telegram",
    color: "#26A5E4",
    icon: "TelegramIcon",
    authMethod: "Bot Token",
    connectUrl: () => "", // Manual entry, no OAuth URL
    exchangeCode: async () => {
      throw new Error("Telegram uses bot token authentication, not OAuth");
    },
  },
  {
    id: "discord",
    name: "Discord",
    color: "#5865F2",
    icon: "DiscordIcon",
    authMethod: "Bot Token / OAuth",
    connectUrl: (redirectUri, state) =>
      `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=identify+guilds+bot&permissions=3072`,
    exchangeCode: async (code, redirectUri) => {
      const resp = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
      return parseDiscordTokenResponse(resp);
    },
    refreshToken: async (token) => {
      const resp = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: token,
        }),
      });
      return parseDiscordTokenResponse(resp);
    },
  },
  {
    id: "slack",
    name: "Slack",
    color: "#4A154B",
    icon: "SlackIcon",
    authMethod: "Slack OAuth 2.0",
    connectUrl: (redirectUri, state) =>
      `https://slack.com/oauth/v2/authorize?client_id=${env.SLACK_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=channels:read,chat:write,files:write,users:read`,
    exchangeCode: async (code, redirectUri) => {
      const resp = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.SLACK_CLIENT_ID,
          client_secret: env.SLACK_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });
      return parseSlackTokenResponse(resp);
    },
    refreshToken: async () => {
      throw new Error("Slack tokens do not expire by default");
    },
  },
];

export function getClientId(platform: PlatformId): string {
  const map: Record<PlatformId, string> = {
    instagram: env.META_APP_ID,
    facebook: env.META_APP_ID,
    threads: env.META_APP_ID,
    twitter: env.TWITTER_CLIENT_ID,
    linkedin: env.LINKEDIN_CLIENT_ID,
    youtube: env.GOOGLE_CLIENT_ID,
    tiktok: env.TIKTOK_CLIENT_KEY,
    pinterest: env.PINTEREST_CLIENT_ID,
    telegram: "",
    discord: env.DISCORD_CLIENT_ID,
    slack: env.SLACK_CLIENT_ID,
  };
  return map[platform] || "";
}

export function isPlatformConfigured(platform: PlatformId): boolean {
  if (platform === "telegram") return true; // manual token
  return getClientId(platform).length > 0;
}

function getPlatformConfig(id: PlatformId): PlatformConfig {
  const platform = PLATFORMS.find((p) => p.id === id);
  if (!platform) throw new Error(`Unknown platform: ${id}`);
  return platform;
}

// --- Token response parsers ---

async function parseMetaTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Meta OAuth error: ${data.error?.message || resp.statusText}`);
  // Exchange short-lived for long-lived
  const longResp = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${env.META_APP_ID}&client_secret=${env.META_APP_SECRET}&fb_exchange_token=${data.access_token}`);
  const longData = await longResp.json();
  return {
    accessToken: longData.access_token || data.access_token,
    expiresAt: longData.expires_in ? new Date(Date.now() + longData.expires_in * 1000) : undefined,
    platformUserId: data.user_id || "",
    username: data.user_id || "",
  };
}

async function parseTwitterTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Twitter OAuth error: ${data.error || resp.statusText}`);
  // Fetch user info
  const userResp = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const userData = await userResp.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    platformUserId: userData.data?.id || "",
    username: userData.data?.username || "",
    displayName: userData.data?.name || "",
  };
}

async function parseLinkedInTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`LinkedIn OAuth error: ${data.error_description || resp.statusText}`);
  // Fetch user info using OpenID
  const userResp = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const userData = await userResp.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    platformUserId: userData.sub || "",
    username: userData.preferred_username || userData.email || "",
    displayName: userData.name || userData.email || "",
    avatarUrl: userData.picture,
  };
}

async function parseGoogleTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Google OAuth error: ${data.error_description || resp.statusText}`);
  // Fetch user info
  const userResp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const userData = await userResp.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    platformUserId: userData.id || "",
    username: userData.email || "",
    displayName: userData.name || "",
    avatarUrl: userData.picture,
  };
}

async function parseTikTokTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`TikTok OAuth error: ${data.error_description || resp.statusText}`);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    platformUserId: data.open_id || "",
    username: data.open_id || "",
    displayName: data.open_id || "",
  };
}

async function parsePinterestTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Pinterest OAuth error: ${data.message || resp.statusText}`);
  // Fetch user info
  const userResp = await fetch("https://api.pinterest.com/v5/user_account", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const userData = await userResp.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    platformUserId: userData.username || "",
    username: userData.username || "",
    displayName: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || userData.username || "",
    avatarUrl: userData.profile_image,
  };
}

async function parseDiscordTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Discord OAuth error: ${data.error_description || resp.statusText}`);
  // Fetch user info
  const userResp = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const userData = await userResp.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    platformUserId: userData.id || "",
    username: userData.username || "",
    displayName: userData.global_name || userData.username || "",
    avatarUrl: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : undefined,
  };
}

async function parseSlackTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok || !data.ok) throw new Error(`Slack OAuth error: ${data.error || resp.statusText}`);
  return {
    accessToken: data.access_token,
    refreshToken: undefined,
    expiresAt: undefined,
    platformUserId: data.authed_user?.id || data.team?.id || "",
    username: data.authed_user?.id || "",
    displayName: data.team?.name || "",
    avatarUrl: data.team?.icon?.image_132,
  };
}
