import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCallbackDto } from './dto/auth-callback.dto';
import { OAuthProvider } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login/:provider')
  async login(@Param('provider') provider: string) {
    const parsedProvider = this.parseProvider(provider);
    const initiateAuthResponse =
      await this.authService.initiateOAuth(parsedProvider);
    return { url: initiateAuthResponse.authUrl, statusCode: 302 };
  }

  @Get('validate/:provider')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  )
  async validate(
    @Param('provider') provider: string,
    @Query('') query: AuthCallbackDto,
  ) {
    const parsedProvider = this.parseProvider(provider);

    await this.authService.handleOAuthCallback({
      provider: parsedProvider,
      code: query.code,
      state: query.state,
    });
  }

  private parseProvider(provider: string): OAuthProvider {
    if (!Object.values(OAuthProvider).includes(provider as OAuthProvider)) {
      throw new BadRequestException(`Invalid OAuth provider: ${provider}`);
    }
    return provider as OAuthProvider;
  }
}
