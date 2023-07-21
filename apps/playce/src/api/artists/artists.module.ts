import { Module } from "@nestjs/common";

import { ArtistModule } from "@lib/crud/artist/artist.module";

import { ArtistsService } from "./artists.service";
import { ArtistsController } from "./artists.controller";

@Module({
  imports: [ArtistModule],
  providers: [ArtistsService],
  controllers: [ArtistsController],
  exports: [ArtistsService],
})
export class ArtistsModule {}
