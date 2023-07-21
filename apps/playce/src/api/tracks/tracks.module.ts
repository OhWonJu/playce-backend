import { Module } from "@nestjs/common";

import { TrackModule } from "@lib/crud/track/track.module";
import { UploadsModule } from "@lib/uploads/uploads.module";

import { TracksService } from "./tracks.service";
import { TracksController } from "./tracks.controller";

@Module({
  imports: [TrackModule, UploadsModule],
  providers: [TracksService],
  controllers: [TracksController],
  exports: [TracksService],
})
export class TracksModule {}
