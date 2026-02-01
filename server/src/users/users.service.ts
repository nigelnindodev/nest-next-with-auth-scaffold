import { Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { Maybe } from 'true-myth';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly userRepository: UsersRepository) {}

  async createUser(data: CreateUserDto): Promise<Maybe<User>> {
    const result = await this.userRepository.createUser({
      ...data,
      meta: data.meta ?? null,
    });

    if (result.isErr) {
      this.logger.error(`Failed to create user: ${result.error.message}`);
      return Maybe.nothing();
    }

    return Maybe.of(result.value);
  }

  async getUser(externalId: string): Promise<Maybe<User>> {
    return this.userRepository.findByExternalId(externalId);
  }

  async getOrCreateUser({
    email,
    name,
  }: {
    email: string;
    name: string;
  }): Promise<Maybe<User>> {
    const maybeUser = await this.userRepository.findByEmail(email);
    return await maybeUser.match({
      Just: (user) => Promise.resolve(Maybe.of(user)),
      Nothing: async () => await this.createUser({ email, name }),
    });
  }

  async updateUser(
    data: Partial<Omit<User, 'email' | 'id' | 'externalId'>> &
      Pick<User, 'externalId'>,
  ): Promise<Maybe<User>> {
    this.logger.log(`Processing update for user: ${data.externalId}`);
    return this.userRepository.updateUser(data);
  }
}
