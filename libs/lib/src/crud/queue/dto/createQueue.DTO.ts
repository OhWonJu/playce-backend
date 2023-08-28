import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateQueueDTO {
  @IsString()
  userId: string;

  // @IsOptional()
  // @IsArray()
  // queueThumbNail: Array<string>;

  // @IsOptional()
  // @IsNumber()
  // songCount: number;

  // @IsOptional()
  // @IsNumber()
  // totalPlayTime: number;

  // @IsOptional()
  // @IsArray()
  // readonly trackIds: Array<string>;
}
