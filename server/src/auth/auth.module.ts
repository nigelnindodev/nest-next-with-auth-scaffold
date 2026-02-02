import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersClientModule } from 'src/users/users-client.module';
import { StrategiesModule } from './strategies/strategies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entity/tokens.entity';
import { AuthRepository } from './user.repository';
import { CryptoService } from './crypto/crypto.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    UsersClientModule,
    StrategiesModule,
  ],
  providers: [AuthService, AuthRepository, CryptoService],
  controllers: [AuthController],
})
export class AuthModule {}
