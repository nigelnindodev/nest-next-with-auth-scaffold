import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GamingPlatforms } from '../user.types';

export class GetOrCreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateUserProfileDto {
  @IsUUID()
  @IsNotEmpty()
  externalId: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(GamingPlatforms, { each: true })
  platforms?: GamingPlatforms[];
}

export class UserProfileDto {
  @Expose()
  externalId: string;

  @Expose()
  @IsOptional()
  bio?: string;

  @Expose()
  @IsOptional()
  avatarUrl?: string;

  @Expose()
  @IsOptional()
  platforms?: GamingPlatforms[];
}

@Exclude()
export class ExternalUserDetailsDto {
  @Expose()
  externalId: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile?: UserProfileDto | null;
}
