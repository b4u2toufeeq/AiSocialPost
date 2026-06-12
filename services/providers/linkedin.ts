import type { SocialProviderAdapter, ProviderCredentials, OAuthTokenResult } from "./types";

export const linkedin: SocialProviderAdapter = {
  platform: "linkedin",
  name: "LinkedIn",
  authMethod: "OAuth 2.0",

  connectUrl(credentials: ProviderCredentials, state: string): string {
    const scopes = credentials.scopes.length > 0
      ? credentials.scopes.join(" ")
      : "openid profile email w_member_social";
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(credentials.redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}`;
  },

  async exchangeCode(code: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
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
    return parseLinkedInTokenResponse(resp);
  },

  async refreshToken(token: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
      }),
    });
    return parseLinkedInTokenResponse(resp);
  },
};

async function parseLinkedInTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`LinkedIn OAuth error: ${data.error_description || resp.statusText}`);
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
