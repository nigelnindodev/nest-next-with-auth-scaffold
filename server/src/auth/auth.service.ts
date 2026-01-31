import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuthStrategyService } from './strategies/strategy.service';
import { randomBytes } from 'node:crypto';
import { OAuthProvider } from './auth.types';
import { RedisService } from 'src/redis';
import { ClientProxy } from '@nestjs/microservices';
import { USER_SERVICE } from 'src/constants';
import { OAuthToken, OAuthUserInfo } from './strategies/strategy.interface';
//import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly STATE_TTL = 600; // 10 minutes

  constructor(
    private readonly oAuthStrategyService: OAuthStrategyService,
    private readonly redisService: RedisService,
    @Inject(USER_SERVICE) private readonly usersClient: ClientProxy,
  ) {}

  private generateState(): string {
    return randomBytes(32).toString('hex');
  }

  private generateStateKey(state: string): string {
    return `oauth_state:${state}`;
  }

  async initiateOAuth(provider: OAuthProvider): Promise<{ authUrl: string }> {
    const strategy = this.oAuthStrategyService.getStrategy(provider);
    const state = this.generateState();

    await this.redisService.setWithExpiry(
      this.generateStateKey(state),
      provider,
      this.STATE_TTL,
    );

    return { authUrl: strategy.getAuthorizationUrl(state) };
  }

  async handleOAuthCallback({
    provider,
    code,
    state,
  }: {
    provider: OAuthProvider;
    code: string;
    state: string;
  }) {
    const maybeStoredProvider = await this.redisService.get(
      this.generateStateKey(state),
    );

    const isStateValid = maybeStoredProvider.match({
      Nothing: () => false,
      Just: (storedValue) => (storedValue as OAuthProvider) === provider,
    });

    if (!isStateValid) {
      this.logger.error(`Invalid or expired state for provider: ${provider}`);
      throw new UnauthorizedException('Invalid OAuth state provided');
    }

    await this.redisService.delete(this.generateStateKey(state));

    const strategy = this.oAuthStrategyService.getStrategy(provider);

    this.logger.log(`Exchanging code for tokens with provider: ${provider}`);
    const tokens: OAuthToken = await strategy.exchangeCodeForTokens(code);

    this.logger.log(`Fetching user information from provider: ${provider}`);
    const userInfo: OAuthUserInfo = await strategy.getUserInformation(
      tokens.accessToken,
    );

    /*const user = await lastValueFrom(
      this.usersClient.send(
        { cmd: 'get_or_create_user' },
        { email: userInfo.email },
      ),
    );*/

    console.log(
      `Auth done for user | ${userInfo.email} | generate session token`,
    );
  }
}
