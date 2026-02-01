import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Put,
  Req,
} from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from '../users.service';
import { ExternalUserDetailsDto } from '../dto/create-user.dto';
import { plainToInstance } from 'class-transformer';

@Controller('user')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly userService: UsersService) {}

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

    const maybeUser = await this.userService.updateUser(updateUserDto);

    if (maybeUser.isNothing) {
      const message = `Update failed. User with external id ${updateUserDto.externalId} not found`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }

    return plainToInstance(ExternalUserDetailsDto, maybeUser.value, {
      excludeExtraneousValues: true,
    });
  }
}
