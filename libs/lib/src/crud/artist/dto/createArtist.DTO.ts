import { IsOptional, IsString } from "class-validator";

export class CreateArtistDTO {
  @IsString()
  readonly artistName: string;

  @IsOptional()
  @IsString()
  readonly artistInfo: string;
}
