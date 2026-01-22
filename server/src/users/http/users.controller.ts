import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Put,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateUserDto, UpdateUserResponseDto } from '../dto/update-user.dto';
import { lastValueFrom } from 'rxjs';

@Controller('user')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(@Inject('USER_SERVICE') readonly userClient: ClientProxy) {}

  @Get('profile')
  async getUser() {
    /**
     * Get to handling JWT for this request
     */
  }

  @Put('profile')
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(
      'Received request to update user profile with externalId: ',
      updateUserDto.externalId,
    );
    const result = await lastValueFrom<UpdateUserResponseDto>(
      this.userClient.send({ cmd: 'update_user' }, updateUserDto),
    );

    return result;
  }
}
