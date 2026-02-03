import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersClientModule } from 'src/users/users-client.module';
import { StrategiesModule } from './strategies/strategies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entity/tokens.entity';
import { AuthRepository } from './user.repository';
import { CryptoService } from './crypto/crypto.service';
import { JwtService } from './jwt/jwt.service';
import { JwtAuthGuard } from './guards/jwt-auth-gaurd';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    forwardRef(() => UsersClientModule), // to fix
    StrategiesModule,
  ],
  providers: [
    AuthService,
    AuthRepository,
    CryptoService,
    JwtService,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [JwtService, JwtAuthGuard],
})
export class AuthModule {}
