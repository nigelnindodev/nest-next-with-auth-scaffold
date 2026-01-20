import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsUUID()
  @IsNotEmpty()
  externalId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export type UpdateUserResponse = {
  externalId: string;
  email: string;
};
