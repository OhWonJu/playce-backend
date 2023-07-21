import { Injectable } from "@nestjs/common";

import { TrackService } from "@lib/crud/track/track.service";
import { CreateTrackDTO } from "@lib/crud/track/dto/createTrack.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { UploadsService } from "@lib/uploads/uploads.service";
import { Track } from "@prisma/client";

@Injectable()
export class TracksService {
  constructor(
    private trackService: TrackService,
    private uploadsService: UploadsService,
  ) {}

  async createTrack(
    file: any,
    createTrackDTO: CreateTrackDTO,
  ): Promise<MutationResponse> {
    const { artistName, albumName } = createTrackDTO;
    const folderName = "artist/" + artistName + "/" + albumName + "/tracks";

    const s3Url = await this.uploadsService.uploadToS3(file, folderName);

    createTrackDTO.trackURL = s3Url;

    return await this.trackService.createTrack(createTrackDTO);
  }

  async getTrackInfo(trackId: string): Promise<Track | undefined> {
    return await this.trackService.getTrack(trackId);
  }
}
