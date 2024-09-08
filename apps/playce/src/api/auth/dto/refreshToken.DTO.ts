import { IsNotEmpty } from "class-validator";

export class RefreshTokenDTO {
  @IsNotEmpty()
  accessToken: string;

  @IsNotEmpty()
  refreshToken: string;
}
