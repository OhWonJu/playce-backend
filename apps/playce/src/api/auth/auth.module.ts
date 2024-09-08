import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { UserModule } from "@lib/crud/user/user.module";

import { GoogleStrategy } from "./google.strategy";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: process.env.PRIVATE_KEY,
      // signOptions: { expiresIn: "7d" }, // access, refresh token 개념을 도입해야합니다.!
    }),
    PassportModule.register({}),
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
