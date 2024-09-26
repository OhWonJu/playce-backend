import { Module } from "@nestjs/common";

import { UserModule } from "@lib/crud/user/user.module";
import { AlbumModule } from "@lib/crud/album/album.module";

import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PlayListModule } from "@lib/crud/play-list/play-list.module";
import { QueueModule } from "@lib/crud/queue/queue.module";
import { DatabaseModule } from "@lib";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    UserModule,
    AlbumModule,
    PlayListModule,
    QueueModule,
    DatabaseModule,
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
