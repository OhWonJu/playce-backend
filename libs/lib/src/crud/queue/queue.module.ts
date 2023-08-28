import { Module } from "@nestjs/common";

import { DatabaseModule } from "@lib/database/database.module";

import { QueueService } from "./queue.service";
import { TrackModule } from "../track/track.module";

@Module({
  imports: [DatabaseModule, TrackModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
