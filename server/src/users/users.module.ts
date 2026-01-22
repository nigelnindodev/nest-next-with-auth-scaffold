import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './http/users.controller';
import { UsersMicroserviceController } from './microservice/users-microservice.controller';
import { UsersClientModule } from './users-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersRepository } from './users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersClientModule],
  providers: [UsersService, UsersRepository],
  controllers: [UsersController, UsersMicroserviceController],
  exports: [UsersRepository],
})
export class UsersModule {}
