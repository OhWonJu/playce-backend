import { IsOptional, IsString } from "class-validator";

export class CreateUserDTO {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsString()
  readonly nickName: string;

  @IsOptional()
  @IsString()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly phoneNumber: string;

  @IsOptional()
  @IsString()
  readonly image: string;

  @IsOptional()
  @IsString()
  readonly hashedPassword: string;
}
