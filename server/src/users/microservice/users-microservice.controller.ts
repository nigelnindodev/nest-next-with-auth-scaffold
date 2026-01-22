import { Controller, Logger } from '@nestjs/common';
import { UsersService } from '../users.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RedisContext,
} from '@nestjs/microservices';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto, UpdateUserResponseDto } from '../dto/update-user.dto';

@Controller('users-microservice')
export class UsersMicroserviceController {
  private readonly logger = new Logger(UsersMicroserviceController.name);

  constructor(private readonly userService: UsersService) {}

  @MessagePattern({ cmd: 'create_user_request' })
  handleCreateUserRequest(
    @Payload() data: CreateUserDto,
    @Ctx() context: RedisContext,
  ) {
    this.logger.log(
      `[redis-${context.getChannel()}] Received request  to create user: `,
      data,
    ); // mask sensitive info
  }

  @MessagePattern({ cmd: 'update_user_request' })
  async handleUpdateUserRequest(
    @Payload() data: UpdateUserDto,
    @Ctx() context: RedisContext,
  ): Promise<UpdateUserResponseDto> {
    this.logger.log(
      `[redis-${context.getChannel()}] Received request to update user: `,
      data,
    ); // mask sensitive info
    return Promise.resolve({
      email: 'placeholder@email.com',
      externalId: 'placeholder_external_id',
      meta: { version: 1, description: 'placeholder, description' },
    });
  }
}
