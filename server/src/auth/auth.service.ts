import {
  Inject,
  Injectable,
  InternalServerErrorException,
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
import { Result } from 'true-myth';
import { lastValueFrom } from 'rxjs';
import { User } from 'src/users/entity/user.entity';

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
    const tokenResult: Result<OAuthToken, Error> =
      await strategy.exchangeCodeForTokens(code);
    if (tokenResult.isErr) {
      this.logger.error(
        `Token exchange failed with provider ${provider}`,
        tokenResult.error.message,
      );
      throw new UnauthorizedException(
        `Failed to authenticate with provider: ${provider}`,
      );
    }

    this.logger.log(`Fetching user information from provider: ${provider}`);
    const userInfoResult: Result<OAuthUserInfo, Error> =
      await strategy.getUserInformation(tokenResult.value.accessToken);
    if (userInfoResult.isErr) {
      this.logger.error(
        `Failed to retrieve user information from provider: ${provider}`,
      );
      throw new UnauthorizedException(
        'Failed to retrieve user information from provider',
      );
    }

    try {
      const user = await lastValueFrom<User>(
        this.usersClient.send<User>(
          { cmd: 'get_or_create_user' },
          {
            email: userInfoResult.value.email,
            name: userInfoResult.value.name,
          },
        ),
      );

      this.logger.log(
        `Auth done for user | ${user.email} | generate session token`,
      );
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'Unknown error occurred';
      this.logger.error(`Micorservice error: ${errorMessage}`);

      throw new InternalServerErrorException(
        'Could not complete user verification at this time',
      );
    }
  }
}
