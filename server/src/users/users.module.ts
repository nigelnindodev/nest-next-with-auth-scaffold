import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './http/users.controller';
import { UsersMicroserviceController } from './microservice/users-microservice.controller';
import { UsersClientModule } from './users-client.module';

@Module({
  imports: [UsersClientModule],
  providers: [UsersService],
  controllers: [UsersController, UsersMicroserviceController],
})
export class UsersModule {}
