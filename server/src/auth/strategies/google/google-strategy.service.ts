import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from 'src/config';
import {
  OAuthStrategy,
  OAuthToken,
  OAuthTokenWithRefresh,
  OAuthUserInfo,
} from '../strategy.interface';
import { OAuthProvider } from 'src/auth/auth.types';
import { Result } from 'true-myth';
import {
  GoogleGetTokenErrorResponse,
  GoogleGetTokenResponse,
  GoogleGetUserInfoErrorResponse,
  GoogleGetUserInfoResponse,
} from './types';
import axios from 'axios';

@Injectable()
export class GoogleOAuthStrategyService implements OAuthStrategy {
  readonly providerName: OAuthProvider = OAuthProvider.GOOGLE;

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;
  private readonly scopes: string[];

  private readonly logger = new Logger(GoogleOAuthStrategyService.name);

  constructor(private readonly appConfigService: AppConfigService) {
    this.clientId = appConfigService.googleOAuthConfiguration.clientId;
    this.clientSecret = appConfigService.googleOAuthConfiguration.clientSecret;
    this.callbackUrl = `${appConfigService.serverBaseUrl}/auth/validate/${this.providerName}`;
    this.scopes = ['email', 'profile'];
  }

  getAuthorizationUrl(state: string): string {
    this.logger.log('Request received to get authorization url');

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', this.callbackUrl);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', this.scopes.join(' '));
    url.searchParams.append('state', state);
    url.searchParams.append('access_type', 'offline');
    url.searchParams.append('prompt', 'consent');

    return url.toString();
  }

  async exchangeCodeForTokens(
    code: string,
  ): Promise<Result<OAuthTokenWithRefresh, Error>> {
    this.logger.log('Exchanging authorization code for tokens');

    try {
      const { data } = await axios.post<GoogleGetTokenResponse>(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.callbackUrl,
          grant_type: 'authorization_code',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 3000,
        },
      );

      if (data.refresh_token === null || data.refresh_token === undefined) {
        const errorMessage = `Refresh token missing in get token response for provider ${this.providerName}. Check access_type in authorization url`;
        this.logger.error(errorMessage);
        return Result.err(new Error(errorMessage));
      }

      this.logger.log('Successfully exchanged authorization code for tokens');
      return Result.ok({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
        expiresIn: data.expires_in,
      });
    } catch (e) {
      if (axios.isAxiosError<GoogleGetTokenErrorResponse>(e)) {
        const status = e.response?.status;
        const errorMessage = e.response?.data
          ? `${e.response.data.error} [${e.response.data.error_description || 'missing error description'}]`
          : e.message;

        this.logger.error(
          `Token exchange HTTP request failed | ${JSON.stringify({ status, error: errorMessage })}`,
        );
        return Result.err(new Error(errorMessage));
      }

      this.logger.error(
        `Token exchange failed | ${e instanceof Error ? e.message : 'Unknown error'}`,
        e instanceof Error ? e.stack : e,
      );
      return Result.err(
        e instanceof Error ? e : new Error('Unknown error occurred'),
      );
    }
  }

  async getUserInformation(
    accessToken: string,
  ): Promise<Result<OAuthUserInfo, Error>> {
    this.logger.log('Fetching user information');

    try {
      const { data } = await axios.get<GoogleGetUserInfoResponse>(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 30000,
        },
      );

      this.logger.log('Successfully fetched user information');
      return Result.ok({
        providerName: this.providerName,
        email: data.email,
        name: data.name,
      });
    } catch (e) {
      if (axios.isAxiosError<GoogleGetUserInfoErrorResponse>(e)) {
        const status = e.response?.status;
        this.logger.error(
          `Full axios error | ${JSON.stringify({
            status: e.response?.status,
            data: e.response?.data,
            code: e.code,
            message: e.message,
          })}`,
        );
        const errorMessage = e.response?.data
          ? `${e.response.data.error.status} [${e.response.data.error.message || 'missing error message'}]`
          : e.message;

        this.logger.error(
          `Fetch user information HTTP request failed | ${JSON.stringify({ status, error: errorMessage })}`,
        );
        return Result.err(new Error(errorMessage));
      }

      this.logger.error(
        `Fetch user information failed | ${e instanceof Error ? e.message : 'Unknown error'}`,
        e instanceof Error ? e.stack : e,
      );
      return Result.err(
        e instanceof Error ? e : new Error('Unknown error occurred'),
      );
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<Result<OAuthToken, Error>> {
    this.logger.log('Refreshing access token');

    try {
      const { data } = await axios.post<GoogleGetTokenResponse>(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 5000,
        },
      );

      this.logger.log('Successfully refreshed access token');
      return Result.ok({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      });
    } catch (e) {
      if (axios.isAxiosError<GoogleGetTokenErrorResponse>(e)) {
        const status = e.response?.status;
        const errorMessage = e.response?.data
          ? `${e.response.data.error} [${e.response.data.error_description || 'missing error description'}]`
          : e.message;

        this.logger.error(
          `Refresh token exchange HTTP request failed | ${JSON.stringify({ status, error: errorMessage })}`,
        );
        return Result.err(new Error(errorMessage));
      }

      this.logger.error(
        `Refresh token exchange failed | ${e instanceof Error ? e.message : 'Unknown error'}`,
        e instanceof Error ? e.stack : e,
      );
      return Result.err(
        e instanceof Error ? e : new Error('Unknown error occurred'),
      );
    }
  }
}
