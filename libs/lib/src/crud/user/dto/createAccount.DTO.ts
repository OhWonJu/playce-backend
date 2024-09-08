import { IsOptional, IsString } from "class-validator";

export class CreateAccountDTO {
  @IsString()
  readonly type: string;

  @IsString()
  readonly provider: string;

  @IsString()
  readonly providerAccountId: string;

  @IsOptional()
  @IsString()
  readonly refresh_token: string;

  @IsOptional()
  @IsString()
  readonly access_token: string;

  @IsOptional()
  @IsString()
  readonly token_type: string;

  @IsOptional()
  @IsString()
  readonly scope: string;

  @IsOptional()
  @IsString()
  readonly id_token: string;

  @IsOptional()
  @IsString()
  readonly session_state: string;

  @IsString()
  readonly userId: string;
}
