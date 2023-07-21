import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

import { UserModule } from "@lib/crud/user/user.module";

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.PRIVATE_KEY,
      signOptions: { expiresIn: "7d" }, // access, refresh token 개념을 도입해야합니다.!
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
