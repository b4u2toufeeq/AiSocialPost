import type { SocialProviderAdapter, ProviderCredentials, OAuthTokenResult } from "./types";

export const youtube: SocialProviderAdapter = {
  platform: "youtube",
  name: "YouTube",
  authMethod: "Google OAuth 2.0",

  connectUrl(credentials: ProviderCredentials, state: string): string {
    const scopes = credentials.scopes.length > 0
      ? credentials.scopes.join(" ")
      : "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile";
    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(credentials.redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;
  },

  async exchangeCode(code: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: credentials.redirectUri,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      }),
    });
    return parseGoogleTokenResponse(resp);
  },

  async refreshToken(token: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      }),
    });
    return parseGoogleTokenResponse(resp);
  },
};

async function parseGoogleTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Google OAuth error: ${data.error_description || resp.statusText}`);
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
