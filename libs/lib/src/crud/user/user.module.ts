import { Module } from "@nestjs/common";

import { DatabaseModule } from "@lib/database/database.module";

import { UserService } from "./user.service";
import { AccountService } from "./account.service";

@Module({
  imports: [DatabaseModule],
  providers: [UserService, AccountService],
  exports: [UserService, AccountService],
})
export class UserModule {}
