import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login/:provider')
  async login(@Param('provider') provider: string) {
    const initiateAuthResponse = await this.authService.initiateOAuth(provider);
    return { url: initiateAuthResponse.authUrl, statusCode: 302 };
  }

  @Get('validate/:provider')
  validate(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    if (!code || !state) {
      throw new BadRequestException('');
    }
  }
}
