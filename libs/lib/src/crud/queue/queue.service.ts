import { Injectable } from "@nestjs/common";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { Queue, Track } from "@prisma/client";
import { TrackService } from "../track/track.service";
import { CreateQueueDTO } from "./dto/createQueue.DTO";
import { UpdateQueueDTO } from "./dto/updateQueue.DTO";

@Injectable()
export class QueueService {
  constructor(
    private prisma: DatabaseService,
    private trackService: TrackService,
  ) {}

  private async saveQueue(CreateQueueDTO: CreateQueueDTO) {
    const { userId } = CreateQueueDTO;

    const newPlayList = this.prisma.queue.create({
      data: {
        userId,
      },
    });

    await this.prisma.$transaction([newPlayList]);
  }

  async createQueue(CreateQueueDTO: CreateQueueDTO): Promise<MutationResponse> {
    try {
      await this.saveQueue(CreateQueueDTO);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: "faild make queue: " + error,
      };
    }
  }

  async getQueue(userId: string): Promise<Queue | undefined> {
    const existQueue = await this.prisma.queue.findUnique({
      where: { userId },
    });

    if (!existQueue) await this.createQueue({ userId });

    return await this.prisma.queue.findUnique({
      where: {
        userId,
      },
    });
  }

  async updateQueue(
    userId: string,
    UpdateQueueDTO: UpdateQueueDTO,
  ): Promise<MutationResponse> {
    const { isAdd, trackId } = UpdateQueueDTO;

    const existQueue = await this.prisma.queue.findFirst({
      where: { userId },
    });

    if (!existQueue) {
      await this.createQueue({ userId });
    }

    // const oldTrackLists = existPlayList.tracks.map((track) => ({
    //   id: track.id,
    // }));
    const upatedTrackList = existQueue.tracks;
    let songCount = existQueue.songCount;
    let totalPlayTime = existQueue.totalPlayTime;
    let queueThumb = existQueue.queueThumbNail;

    const newTrack = await this.trackService.getTrack(trackId);

    const trackIndex = upatedTrackList.findIndex((t: Track) => {
      return t.id === trackId;
    });

    if (isAdd === "true") {
      // ADD TRACK
      // if NOT exist
      if (trackIndex < 0) {
        upatedTrackList.push(newTrack);
        songCount += 1;
        totalPlayTime += newTrack.trackTime;
      }
      if (songCount === 1) {
        queueThumb.push(newTrack.albumArtURL);
      }
    } else {
      // DELETE TRACK
      // if exist
      if (trackIndex > -1) {
        upatedTrackList.splice(trackIndex, 1);
        songCount -= 1;
        totalPlayTime -= newTrack.trackTime;
      }
      if (songCount === 0) {
        queueThumb = [];
      }
    }

    const updatedQueue = this.prisma.queue.update({
      where: { id: existQueue.id },
      data: {
        queueThumbNail: queueThumb,
        songCount,
        totalPlayTime,
        tracks: upatedTrackList,
      },
    });

    try {
      await this.prisma.$transaction([updatedQueue]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: "faild update queue: " + error,
      };
    }
  }
}
