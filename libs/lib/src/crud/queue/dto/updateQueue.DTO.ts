import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateQueueDTO {
  @IsString()
  readonly isAdd: string;

  @IsOptional()
  @IsString()
  readonly trackId: string;
}
