import { Module } from "@nestjs/common";
import { ArtistService } from "./artist.service";
import { DatabaseModule } from "@lib/database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [ArtistService],
  exports: [ArtistService],
})
export class ArtistModule {}
