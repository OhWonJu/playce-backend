import { Module } from "@nestjs/common";

import { DatabaseModule } from "@lib/database/database.module";

import { PlayListService } from "./play-list.service";
import { TrackModule } from "../track/track.module";

@Module({
  imports: [DatabaseModule, TrackModule],
  providers: [PlayListService],
  exports: [PlayListService],
})
export class PlayListModule {}
