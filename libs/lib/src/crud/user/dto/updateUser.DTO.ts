import { IsOptional, IsString } from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly nickName: string;

  @IsOptional()
  @IsString()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly phoneNumber: string;

  @IsOptional()
  @IsString()
  readonly image: string;

  @IsOptional()
  readonly userAlbumIds: string[];

  @IsOptional()
  @IsString()
  readonly hashedPassword: string;
}
