import type { SocialProviderAdapter, ProviderCredentials, OAuthTokenResult, PublishParams, PublishResult } from "./types";

export const pinterest: SocialProviderAdapter = {
  platform: "pinterest",
  name: "Pinterest",
  authMethod: "OAuth 2.0",

  connectUrl(credentials: ProviderCredentials, state: string): string {
    const scopes = credentials.scopes.length > 0
      ? credentials.scopes.join(",")
      : "boards:read,boards:write,pins:read,pins:write,user_accounts:read";
    return `https://www.pinterest.com/oauth/?client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(credentials.redirectUri)}&response_type=code&state=${state}&scope=${scopes}`;
  },

  async exchangeCode(code: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const basic = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64");
    const resp = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: credentials.redirectUri,
      }),
    });
    return parsePinterestTokenResponse(resp);
  },

  async publish(params: PublishParams): Promise<PublishResult> {
    const { content, mediaUrls, accessToken } = params;

    const resp = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: content.slice(0, 100),
        description: content,
        link: mediaUrls?.[0] || "",
        media_source: mediaUrls?.[0]
          ? { source_type: "image_url", url: mediaUrls[0] }
          : undefined,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(`Pinterest publish error: ${data.message || resp.statusText}`);
    return {
      externalPostId: data.id,
      publishedAt: new Date(),
      postUrl: `https://www.pinterest.com/pin/${data.id}/`,
    };
  },

  async refreshToken(token: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const basic = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64");
    const resp = await fetch("https://api.pinterest.com/v5/oauth/token", {
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
    return parsePinterestTokenResponse(resp);
  },
};

async function parsePinterestTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Pinterest OAuth error: ${data.message || resp.statusText}`);
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
