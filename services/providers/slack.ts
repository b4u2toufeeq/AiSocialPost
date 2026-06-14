import type { SocialProviderAdapter, ProviderCredentials, OAuthTokenResult, PublishParams, PublishResult } from "./types";

export const slack: SocialProviderAdapter = {
  platform: "slack",
  name: "Slack",
  authMethod: "Slack OAuth 2.0",

  connectUrl(credentials: ProviderCredentials, state: string): string {
    const scopes = credentials.scopes.length > 0
      ? credentials.scopes.join(",")
      : "channels:read,chat:write,files:write,users:read";
    return `https://slack.com/oauth/v2/authorize?client_id=${credentials.clientId}&redirect_uri=${encodeURIComponent(credentials.redirectUri)}&state=${state}&scope=${scopes}`;
  },

  async publish(params: PublishParams): Promise<PublishResult> {
    const { content, mediaUrls, accessToken } = params;

    const channelsResp = await fetch("https://slack.com/api/conversations.list", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const channelsData = await channelsResp.json();
    if (!channelsData.ok) throw new Error(`Slack channels error: ${channelsData.error}`);

    const channel = channelsData.channels?.[0];
    if (!channel) throw new Error("No Slack channel found");

    const body: Record<string, unknown> = {
      channel: channel.id,
      text: content,
    };

    if (mediaUrls?.length) {
      body.blocks = mediaUrls.map((url) => ({
        type: "image",
        image_url: url,
        alt_text: "Posted image",
      }));
    }

    const msgResp = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const msgData = await msgResp.json();
    if (!msgData.ok) throw new Error(`Slack message error: ${msgData.error}`);

    return {
      externalPostId: msgData.ts,
      publishedAt: new Date(),
      postUrl: `https://slack.com/archives/${channel.id}/p${msgData.ts?.replace(".", "")}`,
    };
  },

  async exchangeCode(code: string, credentials: ProviderCredentials): Promise<OAuthTokenResult> {
    const resp = await fetch("https://slack.com/api/oauth.v2.access", {
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
    return parseSlackTokenResponse(resp);
  },
};

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
