import { IsOptional, IsString } from "class-validator";

export class CreateUserDTO {
  @IsOptional()
  @IsString()
  readonly firstName: string;

  @IsOptional()
  @IsString()
  readonly lastName: string;

  @IsString()
  readonly userName: string;

  @IsString()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly phoneNumber: string;

  @IsString()
  readonly password: string;
}
