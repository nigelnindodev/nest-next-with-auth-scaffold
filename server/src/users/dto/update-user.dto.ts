import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { UserMetaDto } from './create-user.dto';
import { Exclude, Expose, Type } from 'class-transformer';

export class UpdateUserDto {
  @IsUUID()
  @IsNotEmpty()
  externalId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserMetaDto)
  meta: UserMetaDto;
}

@Exclude()
export class UpdateUserResponseDto {
  @Expose()
  externalId: string;

  @Expose()
  email: string;

  @Expose()
  meta: UserMetaDto;
}
