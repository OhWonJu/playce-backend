import { Module } from "@nestjs/common";

import { AlbumModule } from "@lib/crud/album/album.module";
import { UploadsModule } from "@lib/uploads/uploads.module";

import { AlbumsService } from "./albums.service";
import { AlbumsController } from "./albums.controller";

@Module({
  imports: [AlbumModule, UploadsModule],
  providers: [AlbumsService],
  controllers: [AlbumsController],
  exports: [AlbumsService],
})
export class AlbumsModule {}
