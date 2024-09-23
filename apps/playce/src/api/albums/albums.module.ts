import { Module } from "@nestjs/common";

import { AlbumModule } from "@lib/crud/album/album.module";
import { UploadsModule } from "@lib/uploads/uploads.module";

import { AlbumsService } from "./albums.service";
import { AlbumsController } from "./albums.controller";
import { UserModule } from "@lib/crud/user/user.module";

@Module({
  imports: [AlbumModule, UploadsModule, UserModule],
  providers: [AlbumsService],
  controllers: [AlbumsController],
  exports: [AlbumsService],
})
export class AlbumsModule {}
