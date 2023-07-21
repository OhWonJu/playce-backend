import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("login")
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(
      { email: signInDto.email },
      signInDto.password,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post("login/sns")
  signInSNS(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(
      { snsKey: signInDto.snsKey },
      signInDto.password,
    );
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}
