import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

import { UserService } from "@lib/crud/user/user.service";
import {
  AccessPayload,
  GoogleOAuthResult,
  RefreshPayload,
} from "utils/decorators/types/oAuth";
import { AccountService } from "@lib/crud/user/account.service";
import { ConfigService } from "@nestjs/config";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { RefreshTokenDTO } from "./dto/refreshToken.DTO";
import { UNAUTHORIZED } from "utils/errorCodes";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private accountService: AccountService,
    private configService: ConfigService,
  ) {}

  private async generateAccessToken(payload: {
    sub: string;
    username: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRATION_TIME"),
    });
  }

  private async generateRefreshToken(payload: {
    sub: string;
    accountname: string;
  }): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload.sub, accountname: payload.accountname },
      {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>(
          "JWT_REFRESH_EXPIRATION_TIME",
        ),
      },
    );
  }

  async googleOAuth2(data: GoogleOAuthResult): Promise<any> {
    const { accessToken, email, image, name, provider, providerId } = data;

    let isLogin = true;

    // Find Exist User
    let user = await this.userService.findUserByEmail(email);

    // Not Exist User -> Create New User
    if (!user) {
      isLogin = false;

      const result = await this.userService.createTempUser({
        email: null,
        image,
        name,
        hashedPassword: null,
        nickName: "",
        phoneNumber: null,
      });

      if (result.ok && result.data) user = result.data;
      else {
        console.log("user create fail");
        return null;
      }
    }

    // Find Exist Account
    let account = await this.accountService.findAccount({
      provider_providerAccountId: {
        provider: data.provider,
        providerAccountId: data.providerId,
      },
    });

    // Not Exist Account -> Create New Acount
    if (!account) {
      const result = await this.accountService.createAccount({
        type: "oauth",
        provider: provider,
        providerAccountId: providerId,
        access_token: accessToken,
        token_type: "bearer",
        userId: user.id,
        refresh_token: null,
        scope: null,
        id_token: null,
        session_state: null,
      });

      if (result.ok && result.data) {
        account = result.data;
      } else {
        console.log("account create fail");
        return null;
      }
    }

    const serviceToken = await this.generateAccessToken({
      sub: user.id,
      username: user.name,
    });
    const serviceRefreshToken = await this.generateRefreshToken({
      sub: user.id,
      accountname: `${account.provider}+${account.providerAccountId}`,
    });

    const parsedToken = this.jwtService.verify(serviceToken, {
      secret: this.configService.get<string>("PRIVATE_KEY"),
    });

    // Finally Update Account & Connect Accout & User -> Return User Access value
    account.access_token = serviceToken;
    account.expires_at = parsedToken.exp;
    account.refresh_token = serviceRefreshToken;

    await this.accountService.updateAccount(account);

    if (!user.nickName) isLogin = false;

    if (isLogin) {
      return {
        isLogin,
        accessToken: serviceToken,
        expiresAt: parsedToken.exp,
        refreshToken: serviceRefreshToken,
      };
    } else {
      return {
        isLogin,
        accessToken: serviceToken,
        expiresAt: parsedToken.exp,
        refreshToken: serviceRefreshToken,
        email,
      };
    }
  }

  async refresh(refreshTokenDTO: RefreshTokenDTO): Promise<MutationResponse> {
    const { accessToken, refreshToken } = refreshTokenDTO;

    if (!accessToken || !refreshToken)
      return {
        ok: false,
        error: UNAUTHORIZED.NOT_AUTHORIZED.message,
        errorCode: UNAUTHORIZED.NOT_AUTHORIZED.code,
      };

    const decodedAccesToken = this.jwtService.decode(
      accessToken,
    ) as AccessPayload;

    const decodedRefreshToken = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
    }) as RefreshPayload;

    const nowTime = Date.now();

    const refreshTokenExpired = decodedRefreshToken.exp * 1000 - nowTime;

    if (refreshTokenExpired < 0) {
      return {
        ok: false,
        error: UNAUTHORIZED.REFRESH_TOKEN_EXPIRED.message,
        errorCode: UNAUTHORIZED.REFRESH_TOKEN_EXPIRED.code,
      };
    }

    const userIdByRefreshToken = decodedRefreshToken.sub;
    const userIdByAccessToken = decodedAccesToken.sub;

    const user = await this.userService.findUser({
      id: userIdByRefreshToken,
    });
    const userByAccessToken = await this.userService.findUser({
      id: userIdByAccessToken,
    });

    if (!user) {
      return {
        ok: false,
        error: UNAUTHORIZED.INVALID_USER.message,
        errorCode: UNAUTHORIZED.INVALID_ACCOUNT.code,
      };
    }

    if (user.id !== userByAccessToken.id) {
      return {
        ok: false,
        error: UNAUTHORIZED.INVALID_USER_MATCH.message,
        errorCode: UNAUTHORIZED.INVALID_USER_MATCH.code,
      };
    }

    const [provider, providerAccountId] =
      decodedRefreshToken.accountname.split("+");

    const account = await this.accountService.findAccount({
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    });

    if (!account) {
      return {
        ok: false,
        error: UNAUTHORIZED.INVALID_ACCOUNT.message,
        errorCode: UNAUTHORIZED.INVALID_ACCOUNT.code,
      };
    }

    // Generate new access token
    const payload = { sub: user.id, username: user.name };
    const newAccessToken = await this.generateAccessToken(payload);

    const parsedToken = this.jwtService.verify(newAccessToken, {
      secret: this.configService.get<string>("PRIVATE_KEY"),
    });

    account.access_token = newAccessToken;
    account.expires_at = parsedToken.exp;

    const result = await this.accountService.updateAccount(account);

    result.data = { accessToken: newAccessToken, expiresAt: parsedToken.exp };

    return result;
  }
}
