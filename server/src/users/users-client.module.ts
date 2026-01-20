import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppConfigService } from 'src/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        inject: [AppConfigService],
        useFactory: (configService: AppConfigService) => ({
          transport: Transport.REDIS,
          options: configService.redisMicroserviceConfig,
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class UsersClientModule {}
