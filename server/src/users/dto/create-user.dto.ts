import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserMetaDto)
  meta?: UserMetaDto | null;
}

export class UserMetaDto {
  @IsInt()
  @IsNotEmpty()
  version: number;

  @IsString()
  @IsOptional()
  description?: string;
}

@Exclude()
export class ExternalUserDetailsDto {
  @Expose()
  externalId: string;

  @Expose()
  email: string;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => UserMetaDto)
  meta?: UserMetaDto | null;
}
