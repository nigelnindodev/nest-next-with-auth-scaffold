import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppConfigModule, AppConfigService } from './config';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService, RedisModule],
      useFactory: (configService: AppConfigService) =>
        configService.typeOrmConfig,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
