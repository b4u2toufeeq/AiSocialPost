import type { SocialProviderAdapter, OAuthTokenResult, PublishParams, PublishResult } from "./types";

export const telegram: SocialProviderAdapter = {
  platform: "telegram",
  name: "Telegram",
  authMethod: "Bot Token",

  connectUrl(): string {
    return "";
  },

  async exchangeCode(): Promise<OAuthTokenResult> {
    throw new Error("Telegram uses bot token authentication, not OAuth");
  },

  async publish(_params: PublishParams): Promise<PublishResult> {
    throw new Error("Telegram publishing requires bot token — configure in Telegram adapter");
  },
};
