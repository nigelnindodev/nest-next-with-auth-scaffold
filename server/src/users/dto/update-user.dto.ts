import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { UserMetaDto } from './create-user.dto';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsUUID()
  @IsNotEmpty()
  externalId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserMetaDto)
  meta: UserMetaDto;
}
