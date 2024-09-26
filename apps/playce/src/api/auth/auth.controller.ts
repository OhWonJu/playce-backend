import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard as PassporAuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";

import { AuthService } from "./auth.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configServie: ConfigService,
  ) {}

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
    const CLIENT_URL = this.configServie.get("CLIENT_URL");
    const CLIENT_DOMAIN = this.configServie.get("CLIENT_DOMAIN");

    const result = await this.authService.googleOAuth2(req.user);

    res.cookie("playce_access_token", result.accessToken, {
      domain: CLIENT_DOMAIN,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    if (result.isLogin) {
      res.cookie("playce_refresh_token", result.refreshToken, {
        domain: CLIENT_DOMAIN,
        secure: true,
        sameSite: "none",
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${CLIENT_URL}/home`);
    } else {
      res.redirect(`${CLIENT_URL}/join?email=${result.email}`);
    }
  }

  // @UseGuards(AuthGuard)
  @Post("refresh")
  async refreshToken(@Req() req, @Res() res): Promise<MutationResponse> {
    const CLIENT_DOMAIN = this.configServie.get("CLIENT_DOMAIN");

    const accessToken = req.cookies["playce_access_token"];
    const refreshToken = req.cookies["playce_refresh_token"];

    const { data, ...rest } = await this.authService.refresh({
      accessToken,
      refreshToken,
    });

    if (rest.ok) {
      res.cookie("playce_access_token", data.accessToken, {
        domain: CLIENT_DOMAIN,
        secure: true,
        sameSite: "none",
        httpOnly: true,
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });

      res.send(rest);
      return rest;
    } else {
      res.cookie("playce_access_token", "", {
        domain: CLIENT_DOMAIN,
        secure: true,
        sameSite: "none",
        httpOnly: true,
        maxAge: 0,
      });

      res.cookie("playce_refresh_token", "", {
        domain: CLIENT_DOMAIN,
        secure: true,
        sameSite: "none",
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
