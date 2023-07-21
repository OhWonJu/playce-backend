import { IsOptional, IsString } from "class-validator";

export class CreatePlayListDTO {
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  readonly isPublic: boolean;

  @IsString()
  readonly playListName: string;

  @IsOptional()
  @IsString()
  readonly thumbNail: string;
}
