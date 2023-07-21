import { Injectable } from "@nestjs/common";

import { DatabaseService } from "@lib/database/database.service";
import { CreateTrackDTO } from "./dto/createTrack.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { Track } from "@prisma/client";

@Injectable()
export class TrackService {
  constructor(private prisma: DatabaseService) {}

  private async saveTrack(createTrackDTO: CreateTrackDTO) {
    const {
      albumArtURL,
      albumId,
      albumName,
      artistName,
      trackNumber,
      trackTime,
      trackTitle,
      trackURL,
    } = createTrackDTO;

    const newTrack = this.prisma.track.create({
      data: {
        albumArtURL,
        albumName,
        artistName,
        trackNumber: +trackNumber,
        trackTime: +trackTime,
        trackTitle,
        trackURL,
        albumId,
      },
    });

    await this.prisma.$transaction([newTrack]);
  }

  async createTrack(createTrackDTO: CreateTrackDTO): Promise<MutationResponse> {
    try {
      await this.saveTrack(createTrackDTO);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: "fail to make track\n" + error,
      };
    }
  }

  async getTrack(trackId: string): Promise<Track | undefined> {
    return await this.prisma.track.findUnique({
      where: { id: trackId },
    });
  }
}
