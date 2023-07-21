import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

import { UserService } from "@lib/crud/user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signIn(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    pass: string,
  ): Promise<any> {
    const user = await this.userService.findUser(userWhereUniqueInput);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.userName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signInSNS(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    userEmail: string,
  ): Promise<any> {
    const user = await this.userService.findUser(userWhereUniqueInput);
    if (user?.email !== userEmail) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.userName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
