import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersClientModule } from 'src/users/users-client.module';
import { StrategiesModule } from './strategies/strategies.module';

@Module({
  imports: [UsersClientModule, StrategiesModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
