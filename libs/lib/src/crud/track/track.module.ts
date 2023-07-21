import { Module } from "@nestjs/common";
import { TrackService } from "./track.service";
import { DatabaseModule } from "@lib/database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [TrackService],
  exports: [TrackService],
})
export class TrackModule {}
