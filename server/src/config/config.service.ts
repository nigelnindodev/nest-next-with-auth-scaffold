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
      // synchronize: this.get('NODE_ENV') !== 'production'
      // let's keep it simple for now and use synchronize true
      synchronize: true,
      logging: this.get('NODE_ENV') === 'development',
    };
  }

  get httpPort(): number {
    return this.get<number>('HTTP_PORT', 5000);
  }

  get redisMicroserviceConfig(): { host: string; port: number } {
    return {
      host: this.get<string>('REDIS_HOST', 'localhost'),
      port: this.get<number>('REDIS_PORT', 6379),
    };
  }

  get googleOAuthConfiguration() {
    return {
      clientId: this.get<string>(
        'GOOGLE_OAUTH_CLIENT_ID',
        'SET_GOOGLE_OAUTH_CLIENT_ID',
      ),
      clientSecret: this.get<string>(
        'GOOGLE_OAUTH_CLIENT_SECRET',
        'SET_GOOGLE_OAUTH_CLIENT_SECRET',
      ),
    };
  }

  get serverBaseUrl() {
    return this.get<string>(
      'SERVER_BASE_URL',
      `http://localhost:${this.httpPort}`,
    );
  }

  get isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }

  get isProduction() {
    return this.get('NODE_ENV') === 'production';
  }
}
