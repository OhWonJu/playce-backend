import { IsArray, IsString } from "class-validator";

export class CreateOrderDTO {
  @IsArray()
  readonly productIds: string[];

  @IsArray()
  readonly quantities: number[];

  @IsString()
  readonly userId: string;
}
