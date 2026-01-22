export interface OAuthToken {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresIn?: number;
}

export interface OAuthUserInfo {
  providerName: string;
  email: string;
  name: string;
}

export interface OAuthStrategy {
  readonly providerName: string;

  getAuthorizationUrl(state: string): string;

  exchangeCodeForTokens(code: string): Promise<OAuthToken>;

  getUserInformation(accessToken: string): Promise<OAuthUserInfo>;
}
