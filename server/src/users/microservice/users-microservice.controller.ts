import { Controller, Logger } from '@nestjs/common';
import { UsersService } from '../users.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RedisContext,
  RpcException,
} from '@nestjs/microservices';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entity/user.entity';

@Controller('users-microservice')
export class UsersMicroserviceController {
  private readonly logger = new Logger(UsersMicroserviceController.name);

  constructor(private readonly userService: UsersService) {}

  @MessagePattern({ cmd: 'get_or_create_user' })
  async handleCreateUserRequest(
    @Payload() data: CreateUserDto,
    @Ctx() context: RedisContext,
  ): Promise<User> {
    this.logger.log(
      `[redis-${context.getChannel()}] Received request to create or get user with email: `,
      data.email,
    );

    const result = await this.userService.getOrCreateUser(data);

    return result.match({
      Just: (user) => user,
      Nothing: () => {
        throw new RpcException({
          statusCode: 500,
          message: `Could not get or create a user with email: ${data.email}`,
        });
      },
    });
  }
}
