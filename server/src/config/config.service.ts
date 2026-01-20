import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class AppConfigService extends ConfigService {
  get database() {
    return {
      host: this.get<string>('PG_HOST', '0.0.0.0'),
      port: this.get<number>('PG_PORT', 5432),
      username: this.get<string>('PG_USERNAME', 'changeuser'),
      password: this.get<string>('PG_PASSWORD', 'changepass'),
      database: this.get<string>('PG_DATABASE', 'change_dbname'),
    };
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      ...this.database,
      autoLoadEntities: true,
      synchronize: this.get('NODE_ENV') !== 'production', // watch out here!
      logging: this.get('NODE_ENV') === 'development',
    };
  }

  get isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }

  get isProduction() {
    return this.get('NODE_ENV') === 'production';
  }
}
