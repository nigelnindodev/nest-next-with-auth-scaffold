import { BadRequestException, Injectable } from '@nestjs/common';
import { OAuthStrategy } from './strategy.interface';
import { GoogleOAuthStrategyService } from './google/google-strategy.service';

@Injectable()
export class OAuthStrategyService {
  private strategies: Map<string, OAuthStrategy>;

  constructor(
    private readonly googleOAuthStrategy: GoogleOAuthStrategyService,
  ) {
    this.strategies = new Map([
      [this.googleOAuthStrategy.providerName, this.googleOAuthStrategy],
    ]);
  }

  getSupportedProviders(): string[] {
    return Array.from(this.strategies.keys());
  }

  hasProvider(provider: string): boolean {
    return this.strategies.has(provider);
  }

  getStrategy(provider: string): OAuthStrategy {
    const strategy = this.strategies.get(provider);

    if (!strategy) {
      throw new BadRequestException(
        `Unsupported OAuth provider: ${provider} | Supported providers: `,
      );
    }

    return strategy;
  }
}
