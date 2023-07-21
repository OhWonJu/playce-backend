import { Injectable } from "@nestjs/common";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { CreatePlayListDTO } from "./dto/createPlayList.DTO";
import { PlayList } from "@prisma/client";
import { GetPlayListsDTO } from "./dto/getPlayLists.DTO";
import { UpdatePlayListDTO } from "./dto/updatePlayList.DTO";
import { TrackService } from "../track/track.service";

@Injectable()
export class PlayListService {
  constructor(
    private prisma: DatabaseService,
    private trackService: TrackService,
  ) {}

  private async savePlayList(CreatePlayListDTO: CreatePlayListDTO) {
    const { isPublic, playListName, thumbNail, userId } = CreatePlayListDTO;

    const newPlayList = this.prisma.playList.create({
      data: {
        isPublic,
        playListName,
        thumbNail,
        userId,
      },
    });

    await this.prisma.$transaction([newPlayList]);
  }

  async createPlayList(
    CreatePlayListDTO: CreatePlayListDTO,
  ): Promise<MutationResponse> {
    try {
      await this.savePlayList(CreatePlayListDTO);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: "faild make play list: " + error,
      };
    }
  }

  async getAllPlayList(
    userId: string,
    option: GetPlayListsDTO,
  ): Promise<PlayList[] | undefined> {
    const { limit, offset } = option;

    return await this.prisma.playList.findMany({
      where: {
        userId,
      },
      skip: offset,
      take: limit,
    });
  }

  async getPlayList(playListId: string): Promise<PlayList | undefined> {
    return await this.prisma.playList.findFirst({
      where: {
        id: playListId,
      },
    });
  }

  async updatePlayList(
    playListId: string,
    userId: string,
    UpdatePlayListDTO: UpdatePlayListDTO,
  ): Promise<MutationResponse> {
    const { trackIds, isPublic, playListName, thumbNail } = UpdatePlayListDTO;

    const existPlayList = await this.prisma.playList.findFirst({
      where: { id: playListId, userId },
    });

    if (!existPlayList) {
      return {
        ok: false,
        error: "playList not exist or not your play list",
      };
    }

    // const oldTrackLists = existPlayList.tracks.map((track) => ({
    //   id: track.id,
    // }));
    const newTrackList = await Promise.all(
      trackIds.map(async (id) => await this.trackService.getTrack(id)),
    );

    const updatedPlayList = this.prisma.playList.update({
      where: { id: existPlayList.id },
      data: {
        isPublic,
        playListName,
        thumbNail,
        ...(trackIds && {
          tracks: newTrackList,
        }),
      },
    });

    try {
      await this.prisma.$transaction([updatedPlayList]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: "faild update playlist: " + error,
      };
    }
  }
}
