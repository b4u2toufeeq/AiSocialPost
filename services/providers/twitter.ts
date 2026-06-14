import crypto from "crypto";
import type { SocialProviderAdapter, ProviderCredentials, OAuthTokenResult, PublishParams, PublishResult } from "./types";

export const twitter: SocialProviderAdapter = {
  platform: "twitter",
  name: "Twitter / X",
  authMethod: "OAuth 2.0 PKCE",

  connectUrl(credentials: ProviderCredentials, state: string): string {
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
    const compositeState = `${state}.${codeVerifier}`;
    const scopes = credentials.scopes.length > 0
      ? credentials.scopes.join(" ")
      : "tweet.read tweet.write users.read offline.access";
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(credentials.redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${compositeState}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  },

  async exchangeCode(code: string, credentials: ProviderCredentials, codeVerifier?: string): Promise<OAuthTokenResult> {
    const actualVerifier = codeVerifier ? codeVerifier.split(".").slice(1).join(".") : code;
    const basic = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64");
    const resp = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: credentials.redirectUri,
        code_verifier: actualVerifier,
      }),
    });
    return parseTwitterTokenResponse(resp);
  },

  async refreshToken(token: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const basic = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64");
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

  async publish(params: PublishParams): Promise<PublishResult> {
    const { content, mediaUrls, accessToken } = params;

    let mediaIds: string[] = [];
    if (mediaUrls?.length) {
      mediaIds = await Promise.all(
        mediaUrls.map((url) => uploadTwitterMedia(url, accessToken))
      );
    }

    const body: Record<string, unknown> = { text: content };
    if (mediaIds.length > 0) {
      body.media = { media_ids: mediaIds };
    }

    const resp = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(`Twitter publish error: ${data.detail || JSON.stringify(data)}`);

    return {
      externalPostId: data.data?.id || "",
      publishedAt: new Date(),
      postUrl: `https://twitter.com/i/web/status/${data.data?.id}`,
    };
  },
};

async function uploadTwitterMedia(mediaUrl: string, accessToken: string): Promise<string> {
  const mediaResp = await fetch(mediaUrl);
  const buffer = Buffer.from(await mediaResp.arrayBuffer());

  const formData = new FormData();
  formData.append("media", new Blob([buffer]), "media.jpg");

  const resp = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(`Twitter media upload error: ${data.errors?.[0]?.message || resp.statusText}`);
  return data.media_id_string;
}

async function parseTwitterTokenResponse(resp: Response): Promise<OAuthTokenResult> {
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Twitter OAuth error: ${data.error || resp.statusText}`);
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
