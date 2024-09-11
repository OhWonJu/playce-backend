import { Expose, Transform } from "class-transformer";
import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdatePlayListDTO {
  @Expose()
  @Transform((value) => {
    return value.value == "true" ? true : false;
  })
  @IsOptional()
  readonly isPublic: boolean;

  @IsOptional()
  @IsString()
  readonly playListName: string;

  @IsOptional()
  @IsString()
  readonly thumbNail: string;

  @Expose()
  @Transform((value) => {
    return value.value == "true" ? true : false;
  })
  @IsOptional()
  readonly isAdd: boolean;

  @IsOptional()
  @IsString()
  readonly trackId: string;

  @IsOptional()
  @IsArray()
  readonly trackIds: Array<string>;
}
