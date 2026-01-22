import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Maybe } from 'true-myth';

@Injectable()
export class UsersRepository {
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

  async createUser() {}

  async updateuser() {}
}
