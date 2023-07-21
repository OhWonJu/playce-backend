import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTrackDTO {
  @IsString()
  readonly artistName: string;

  @IsString()
  readonly albumName: string;

  @IsString()
  readonly albumArtURL: string;

  @IsString()
  readonly trackTitle: string;

  @IsOptional()
  @IsString()
  trackURL: string;

  @IsNumber()
  readonly trackNumber: number;

  @IsNumber()
  readonly trackTime: number;

  @IsString()
  readonly albumId: string;
}
