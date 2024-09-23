import { Module } from "@nestjs/common";

import { DatabaseModule } from "@lib/database/database.module";

import { UserService } from "./user.service";
import { AccountService } from "./account.service";
import { OrderService } from "./order.service";
import { UserAlbumService } from "./userAlbum.service";

@Module({
  imports: [DatabaseModule],
  providers: [UserService, AccountService, OrderService, UserAlbumService],
  exports: [UserService, AccountService, OrderService, UserAlbumService],
})
export class UserModule {}
