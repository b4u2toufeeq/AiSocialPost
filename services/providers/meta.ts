import type { SocialProviderAdapter, ProviderCredentials, OAuthTokenResult, PublishParams, PublishResult, PlatformId } from "./types";

class MetaAdapter implements SocialProviderAdapter {
  readonly platform: PlatformId;
  readonly name: string;
  readonly authMethod = "Meta OAuth 2.0";
  private readonly scopeMap: Record<string, string>;

  constructor(platform: PlatformId, name: string, scopes: string) {
    this.platform = platform;
    this.name = name;
    this.scopeMap = { [platform]: scopes };
  }

  private get graphBase() {
    return this.platform === "threads" ? "https://graph.threads.net" : "https://graph.facebook.com";
  }

  private get tokenUrl() {
    return `${this.graphBase}/v19.0/oauth/access_token`;
  }

  connectUrl(credentials: ProviderCredentials, state: string): string {
    const scopes = credentials.scopes.length > 0
      ? credentials.scopes.join(",")
      : this.scopeMap[this.platform];
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(credentials.redirectUri)}&state=${state}&scope=${scopes}`;
  }

  async exchangeCode(code: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: credentials.redirectUri,
        code,
      }),
    });
    return this.parseTokenResponse(resp, credentials);
  }

  async refreshToken(token: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch(
      `${this.tokenUrl}?grant_type=fb_exchange_token&client_id=${credentials.clientId}&client_secret=${credentials.clientSecret}&fb_exchange_token=${token}`,
    );
    return this.parseTokenResponse(resp, credentials);
  }

  async publish(params: PublishParams): Promise<PublishResult> {
    const { content, mediaUrls, accessToken } = params;

    if (this.platform === "facebook") {
      const resp = await fetch(
        `https://graph.facebook.com/v19.0/me/feed?access_token=${accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            ...(mediaUrls?.length ? { attached_media: mediaUrls.map((url) => ({ media_fbid: url })) } : {}),
          }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(`Facebook publish error: ${data.error?.message || resp.statusText}`);
      return {
        externalPostId: data.id,
        publishedAt: new Date(),
        postUrl: `https://www.facebook.com/${data.id}`,
      };
    }

    if (this.platform === "instagram") {
      const userResp = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
      );
      const userData = await userResp.json();
      const igUserId = userData.data?.[0]?.instagram_business_account?.id;
      if (!igUserId) throw new Error("No Instagram business account found");

      const mediaResp = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/media?access_token=${accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: mediaUrls?.[0] || "",
            caption: content,
          }),
        }
      );
      const mediaData = await mediaResp.json();
      if (!mediaResp.ok) throw new Error(`Instagram media creation error: ${mediaData.error?.message || mediaResp.statusText}`);

      const publishResp = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/media_publish?access_token=${accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creation_id: mediaData.id }),
        }
      );
      const publishData = await publishResp.json();
      if (!publishResp.ok) throw new Error(`Instagram publish error: ${publishData.error?.message || publishResp.statusText}`);

      return {
        externalPostId: publishData.id,
        publishedAt: new Date(),
        postUrl: `https://www.instagram.com/p/${publishData.id}/`,
      };
    }

    throw new Error(`Publishing not supported for ${this.platform} yet`);
  }

  private async parseTokenResponse(resp: Response, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const data = await resp.json();
    if (!resp.ok) throw new Error(`Meta OAuth error: ${data.error?.message || resp.statusText}`);

    const longResp = await fetch(
      `${this.tokenUrl}?grant_type=fb_exchange_token&client_id=${credentials.clientId}&client_secret=${credentials.clientSecret}&fb_exchange_token=${data.access_token}`,
    );
    const longData = await longResp.json();
    return {
      accessToken: longData.access_token || data.access_token,
      expiresAt: longData.expires_in ? new Date(Date.now() + longData.expires_in * 1000) : undefined,
      platformUserId: data.user_id || "",
      username: data.user_id || "",
    };
  }
}

export const instagram = new MetaAdapter("instagram", "Instagram", "instagram_basic,instagram_content_publish,pages_read_engagement");
export const facebook = new MetaAdapter("facebook", "Facebook", "pages_manage_posts,pages_read_engagement,pages_show_list");
export const threads = new MetaAdapter("threads", "Threads", "threads_basic,threads_content_publish");
