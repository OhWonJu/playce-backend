import { Type } from "class-transformer";
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

  @Type(() => Number)
  @IsNumber()
  readonly trackNumber: number;

  @IsOptional()
  @IsNumber()
  trackTime: number;

  @IsOptional()
  @IsNumber({}, { each: true })
  peaks: number[];

  @IsString()
  readonly albumId: string;
}
