import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppConfigService } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const httpApp = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: process.env.NODE_ENV === 'production' ? false : true,
    }),
  });

  /**
   * Some httpApp configuration coming up probably i.e CORS, cookier parsing, ...
   */

  const configService = httpApp.get(AppConfigService);
  const httpPort = configService.httpPort;
  await httpApp.listen(httpPort);
  logger.log('HTTP application started on port: ', httpPort);

  const redisMicroservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.REDIS,
      options: configService.redisMicroserviceConfig,
    });
  await redisMicroservice.listen();
  logger.log('Redis microservice started');
}
bootstrap();
