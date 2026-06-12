import type { SocialProviderAdapter, ProviderCredentials, OAuthTokenResult } from "./types";

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
};
