import type { SocialProviderAdapter, ProviderCredentials, OAuthTokenResult, PublishParams, PublishResult } from "./types";

export const discord: SocialProviderAdapter = {
  platform: "discord",
  name: "Discord",
  authMethod: "Bot Token / OAuth",

  connectUrl(credentials: ProviderCredentials, state: string): string {
    const scopes = credentials.scopes.length > 0
      ? credentials.scopes.join(" ")
      : "identify guilds bot";
    return `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(credentials.redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}&permissions=3072`;
  },

  async exchangeCode(code: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: credentials.redirectUri,
      }),
    });
    return parseDiscordTokenResponse(resp);
  },

  async publish(params: PublishParams): Promise<PublishResult> {
    const { content, accessToken } = params;

    const resp = await fetch("https://discord.com/api/users/@me/channels", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const channels = await resp.json();
    if (!resp.ok) throw new Error(`Discord channels error: ${channels.error_description || resp.statusText}`);

    const channelId = channels.id;
    const msgResp = await fetch(`https://discord.com/api/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    const msgData = await msgResp.json();
    if (!msgResp.ok) throw new Error(`Discord message error: ${msgData.error_description || msgResp.statusText}`);

    return {
      externalPostId: msgData.id,
      publishedAt: new Date(),
      postUrl: `https://discord.com/channels/@me/${channelId}/${msgData.id}`,
    };
  },

  async refreshToken(token: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        grant_type: "refresh_token",
        refresh_token: token,
      }),
    });
    return parseDiscordTokenResponse(resp);
  },
};

async function parseDiscordTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Discord OAuth error: ${data.error_description || resp.statusText}`);
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
