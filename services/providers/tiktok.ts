import type { SocialProviderAdapter, ProviderCredentials, OAuthTokenResult } from "./types";

export const tiktok: SocialProviderAdapter = {
  platform: "tiktok",
  name: "TikTok",
  authMethod: "TikTok OAuth 2.0",

  connectUrl(credentials: ProviderCredentials, state: string): string {
    const scopes = credentials.scopes.length > 0
      ? credentials.scopes.join(",")
      : "user.info.basic,video.publish,video.upload";
    return `https://www.tiktok.com/v2/auth/authorize?client_key=${credentials.clientId}&response_type=code&redirect_uri=${encodeURIComponent(credentials.redirectUri)}&state=${state}&scope=${scopes}`;
  },

  async exchangeCode(code: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
      body: new URLSearchParams({
        client_key: credentials.clientId,
        client_secret: credentials.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: credentials.redirectUri,
      }),
    });
    return parseTikTokTokenResponse(resp);
  },

  async refreshToken(token: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: credentials.clientId,
        client_secret: credentials.clientSecret,
        grant_type: "refresh_token",
        refresh_token: token,
      }),
    });
    return parseTikTokTokenResponse(resp);
  },
};

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
