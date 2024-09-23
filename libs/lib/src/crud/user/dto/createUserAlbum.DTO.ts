import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateUserAlbumDTO {
  @IsArray()
  readonly albumIds: string[];

  @IsOptional()
  @IsString()
  userId: string;
}
