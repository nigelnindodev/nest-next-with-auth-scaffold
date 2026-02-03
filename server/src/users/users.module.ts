import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './http/users.controller';
import { UsersMicroserviceController } from './microservice/users-microservice.controller';
import { UsersClientModule } from './users-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersRepository } from './users.repository';
import { UserProfileRepository } from './user-profile.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UserProfile } from './entity/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    UsersClientModule,
    forwardRef(() => AuthModule), // to fix
  ],
  providers: [UsersService, UsersRepository, UserProfileRepository],
  controllers: [UsersController, UsersMicroserviceController],
})
export class UsersModule {}
