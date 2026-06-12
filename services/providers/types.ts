export type PlatformId =
  | "instagram"
  | "facebook"
  | "threads"
  | "twitter"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "telegram"
  | "discord"
  | "slack";

export type ProviderType = "system" | "custom";

export interface ProviderCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  tokenSecret?: string;
  expiresAt?: Date;
  platformUserId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface SocialProviderAdapter {
  readonly platform: PlatformId;
  readonly name: string;
  readonly authMethod: string;

  connectUrl(credentials: ProviderCredentials, state: string): string;
  exchangeCode(
    code: string,
    credentials: ProviderCredentials,
    codeVerifier?: string,
  ): Promise<OAuthTokenResult>;
  refreshToken?(refreshToken: string, credentials: ProviderCredentials): Promise<OAuthTokenResult>;
  getProfile?(accessToken: string): Promise<{ username: string; displayName?: string; avatarUrl?: string }>;
}

export interface ProviderConfig {
  id: string;
  platform: PlatformId;
  providerType: ProviderType;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  isActive: boolean;
  createdAt: string;
}

export interface ConnectedAccount {
  id: string;
  platform: string;
  platformUserId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  expiresAt: string | null;
  status: string;
  createdAt: string;
}
