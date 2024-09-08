import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard as PassporAuthGuard } from "@nestjs/passport";

import { AuthService } from "./auth.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";

import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // @HttpCode(HttpStatus.OK)
  // @Post("login")
  // signIn(@Body() signInDto: Record<string, any>) {
  //   return this.authService.signIn(
  //     { email: signInDto.email },
  //     signInDto.password,
  //   );
  // }

  @UseGuards(PassporAuthGuard("google"))
  @Get("v2/google")
  async googleAuth(): Promise<void> {
    // redirect google login page
  }

  @UseGuards(PassporAuthGuard("google"))
  @Get("v2/google/callback")
  async googleAuthCallback(@Req() req, @Res() res) {
    const result = await this.authService.googleOAuth2(req.user);

    res.cookie("playce_access_token", result.accessToken, {
      // domain: "localhost",
      // path: "/",
      httpOnly: true,
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    if (result.isLogin) {
      res.cookie("playce_expires_at", result.expiresAt, {
        maxAge: 90 * 24 * 60 * 60 * 1000,
      });

      res.cookie("playce_refresh_token", result.refreshToken, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });

      res.redirect("http://localhost:5173/home");
    } else {
      res.redirect(`http://localhost:5173/join?email=${result.email}`);
    }
  }

  // @UseGuards(AuthGuard)
  @Post("refresh")
  async refreshToken(@Req() req, @Res() res): Promise<MutationResponse> {
    const accessToken = req.cookies["playce_access_token"];
    const refreshToken = req.cookies["playce_refresh_token"];

    const { data, ...rest } = await this.authService.refresh({
      accessToken,
      refreshToken,
    });

    if (rest.ok) {
      res.cookie("playce_access_token", data.accessToken, {
        httpOnly: true,
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });

      res.cookie("playce_expires_at", data.expiresAt, {
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });

      res.send(rest);
      return rest;
    } else {
      res.cookie("playce_access_token", "", {
        httpOnly: true,
        maxAge: 0,
      });

      res.cookie("playce_expires_at", "", {
        maxAge: 0,
      });

      res.cookie("playce_refresh_token", "", {
        httpOnly: true,
        maxAge: 0,
      });
      res.send(rest);
      return rest;
    }
  }

  // @UseGuards(AuthGuard)
  // @Get("profile")
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
