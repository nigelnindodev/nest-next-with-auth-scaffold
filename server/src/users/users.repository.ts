import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Maybe, Result } from 'true-myth';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<Maybe<User>> {
    return Maybe.of(await this.userRepository.findOneBy({ id }));
  }

  async findByEmail(email: string): Promise<Maybe<User>> {
    const user = await this.userRepository.findOneBy({ email });
    return Maybe.of(user);
  }

  async findByExternalId(externalId: string): Promise<Maybe<User>> {
    return Maybe.of(await this.userRepository.findOneBy({ externalId }));
  }

  async createUser(
    userData: Omit<User, 'id' | 'externalId' | 'createdAt' | 'updatedAt'>,
  ): Promise<Result<User, Error>> {
    this.logger.log(
      `Attempting to create new user with email ${userData.email}`,
    );
    try {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      return Result.ok(savedUser);
    } catch (e) {
      this.logger.error(
        `Failed to create user with email ${userData.email}`,
        e,
      );
      return Result.err(
        e instanceof Error ? e : new Error('Failed to create user'),
      );
    }
  }

  async updateUser(
    userData: Partial<Omit<User, 'email' | 'id' | 'externalId'>> &
      Pick<User, 'externalId'>,
  ): Promise<Maybe<User>> {
    try {
      const maybeUser = await this.findByExternalId(userData.externalId);

      if (maybeUser.isNothing) return Maybe.nothing();

      this.logger.log(`Updating user with external id ${userData.externalId}`);
      const updatedUser = await this.userRepository.save({
        ...maybeUser.value,
        ...userData,
      });

      return Maybe.of(updatedUser);
    } catch (e) {
      this.logger.error(
        `Failed to update user with external id ${userData.externalId}`,
        e,
      );
      return Maybe.nothing();
    }
  }
}
