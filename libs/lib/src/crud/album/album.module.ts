import { Module } from "@nestjs/common";
import { AlbumService } from "./album.service";
import { DatabaseModule } from "@lib/database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [AlbumService],
  exports: [AlbumService],
})
export class AlbumModule {}
