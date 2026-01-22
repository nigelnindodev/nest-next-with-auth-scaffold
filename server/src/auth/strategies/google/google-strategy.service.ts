import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from 'src/config';
import {
  OAuthStrategy,
  OAuthToken,
  OAuthUserInfo,
} from '../strategy.interface';

/* eslint-disable @typescript-eslint/no-unused-vars */

@Injectable()
export class GoogleOAuthStrategyService implements OAuthStrategy {
  readonly providerName: string;

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;
  private readonly scopes: string;

  private readonly logger = new Logger(GoogleOAuthStrategyService.name);

  constructor(private readonly appConfigService: AppConfigService) {}
  getAuthorizationUrl(state: string): string {
    this.logger.log('Request received to get authorization url');
    throw new Error('Method not implemented.');
  }

  exchangeCodeForTokens(code: string): Promise<OAuthToken> {
    throw new Error('Method not implemented.');
  }

  getUserInformation(accessToken: string): Promise<OAuthUserInfo> {
    throw new Error('Method not implemented.');
  }
}
