import { IsOptional, IsString } from "class-validator";
import { Expose, Transform } from "class-transformer";

export class CreatePlayListDTO {
  @IsOptional()
  @IsString()
  userId: string;

  @Expose()
  @Transform((value) => {
    return value.value == "true" ? true : false;
  })
  isPublic: boolean;

  @IsString()
  readonly playListName: string;

  @IsOptional()
  @IsString()
  readonly thumbNail: string;
}
