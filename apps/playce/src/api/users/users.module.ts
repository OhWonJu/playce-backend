import { Module } from "@nestjs/common";

import { UserModule } from "@lib/crud/user/user.module";
import { AlbumModule } from "@lib/crud/album/album.module";

import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PlayListModule } from "@lib/crud/play-list/play-list.module";
import { QueueModule } from "@lib/crud/queue/queue.module";

@Module({
  imports: [UserModule, AlbumModule, PlayListModule, QueueModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
