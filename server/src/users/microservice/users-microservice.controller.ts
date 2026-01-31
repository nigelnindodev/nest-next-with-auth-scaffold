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

  @MessagePattern({ cmd: 'create_user_request' })
  async handleCreateUserRequest(
    @Payload() data: CreateUserDto,
    @Ctx() context: RedisContext,
  ): Promise<User> {
    this.logger.log(
      `[redis-${context.getChannel()}] Received request to create user with email: `,
      data.email,
    );

    /**
     * Handling here should be more robust for other scenarios
     * - What if user already exists?
     *
     * createUser should return a possible errors
     * custom codes should be in response so that downstream business logic can be run
     */
    const result = await this.userService.createUser(data);

    return result.match({
      Just: (user) => user,
      Nothing: () => {
        throw new RpcException({
          statusCode: 500,
          message: `Could not create a user with email: ${data.email}`,
        });
      },
    });
  }
}
