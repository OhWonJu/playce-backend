import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdatePlayListDTO {
  @IsOptional()
  @IsString()
  readonly isPublic: boolean;

  @IsOptional()
  @IsString()
  readonly playListName: string;

  @IsOptional()
  @IsString()
  readonly thumbNail: string;

  @IsOptional()
  @IsArray()
  readonly trackIds: Array<string>;
}
