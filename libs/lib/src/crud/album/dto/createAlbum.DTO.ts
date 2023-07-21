import { IsOptional, IsString } from "class-validator";

export class CreateAlbumDTO {
  @IsString()
  readonly albumCode: string;

  @IsString()
  readonly albumName: string;

  @IsOptional()
  @IsString()
  albumArtURL: string;

  @IsString()
  readonly albumType: string;

  @IsOptional()
  @IsString()
  readonly albumInfo: string;

  @IsString()
  readonly artistName: string;

  @IsString()
  readonly artistId: string;
}
