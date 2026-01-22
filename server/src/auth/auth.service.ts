import { Injectable, Logger } from '@nestjs/common';
import { OAuthStrategyService } from './strategies/strategy.service';
import { randomBytes } from 'node:crypto';
import { OAuthProvider } from './auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly oAuthStrategyService: OAuthStrategyService) {}

  private generateState(): string {
    return randomBytes(32).toString('hex');
  }

  initiateOAuth(provider: OAuthProvider): Promise<{ authUrl: string }> {
    const strategy = this.oAuthStrategyService.getStrategy(provider);
    const state = this.generateState();

    // TODO: Store state in Redis
    return Promise.resolve({ authUrl: strategy.getAuthorizationUrl(state) });
  }

  // Ensure no confusion between these params
  handleOAuthCallback(provider: string, code: string, state: string) {
    this.logger.log(
      `Auth callback: provider = ${provider} | code = ${code} | state = ${state}`,
    );
  }
}
