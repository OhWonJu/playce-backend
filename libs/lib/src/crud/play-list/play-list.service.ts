import { Injectable } from "@nestjs/common";
import * as _ from "lodash";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { CreatePlayListDTO } from "./dto/createPlayList.DTO";
import { PlayList, Track } from "@prisma/client";
import { GetPlayListsDTO } from "./dto/getPlayLists.DTO";
import { UpdatePlayListDTO } from "./dto/updatePlayList.DTO";
import { TrackService } from "../track/track.service";
import { GetPlaylistsResponse } from "apps/playce/src/api/users/dto/getPlaylistsResponse";

@Injectable()
export class PlayListService {
  constructor(
    private prisma: DatabaseService,
    private trackService: TrackService,
  ) {}

  private playlistBatch = 15;

  private async savePlayList(CreatePlayListDTO: CreatePlayListDTO) {
    const { isPublic, playListName, thumbNail, userId } = CreatePlayListDTO;

    const newPlayList = this.prisma.playList.create({
      data: {
        isPublic: isPublic,
        playListName,
        thumbNail: thumbNail ?? [],
        userId,
      },
    });

    await this.prisma.$transaction([newPlayList]);
  }

  async createPlayList(
    createPlayListDTO: CreatePlayListDTO,
  ): Promise<MutationResponse> {
    try {
      await this.savePlayList(createPlayListDTO);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        errorCode: 500,
        error: "faild make play list",
      };
    }
  }

  async getAllPlayList(
    userId: string,
    option: GetPlayListsDTO,
  ): Promise<GetPlaylistsResponse> {
    const { cursor } = option;

    const playlists = await this.prisma.playList.findMany({
      where: {
        userId,
      },
      take: this.playlistBatch,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
      select: {
        id: true,
        isPublic: true,
        playListName: true,
        thumbNail: true,
        count: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    let nextCursor = null;

    if (playlists.length === this.playlistBatch) {
      nextCursor = playlists[this.playlistBatch - 1].id;
    }

    return {
      playlists: playlists,
      nextCursor,
    };
  }

  async getPlayList(playListId: string): Promise<PlayList | undefined> {
    return await this.prisma.playList.findFirst({
      where: {
        id: playListId,
      },
    });
  }

  async getTracksByPlaylist(playlistId: string): Promise<any | undefined> {
    return await this.prisma.playList.findUnique({
      where: { id: playlistId },
      select: {
        id: true,
        userId: true,
        tracks: true,
      },
    });
  }

  async updatePlayList(
    playListId: string,
    userId: string,
    UpdatePlayListDTO: UpdatePlayListDTO,
  ): Promise<MutationResponse> {
    const { trackIds, isPublic, playListName, thumbNail, isAdd, trackId } =
      UpdatePlayListDTO;

    const playList = await this.prisma.playList.findFirst({
      where: { id: playListId, userId },
    });

    if (!playList) {
      return {
        ok: false,
        errorCode: 404,
        error: "playList not exist or not your play list",
      };
    }

    const upatedTrackList = playList.tracks;
    let songCount = playList.count;
    const playListThumbNailMap = playList.thumbNailMap ?? {};

    const newTrack = await this.trackService.getTrack(trackId);

    const trackIndex = upatedTrackList.findIndex((t: Track) => {
      return t.id === trackId;
    });

    if (isAdd) {
      if (trackIndex < 0) {
        upatedTrackList.push(newTrack);
        songCount += 1;
      }

      if (playListThumbNailMap[newTrack.albumArtURL]) {
        playListThumbNailMap[newTrack.albumArtURL] += 1;
      } else {
        playListThumbNailMap[newTrack.albumArtURL] = 1;
      }
    } else {
      if (trackIndex > -1) {
        upatedTrackList.splice(trackIndex, 1);
        songCount -= 1;
      }
      if (playListThumbNailMap[newTrack.albumArtURL]) {
        playListThumbNailMap[newTrack.albumArtURL] === 1
          ? delete playListThumbNailMap[newTrack.albumArtURL]
          : (playListThumbNailMap[newTrack.albumArtURL] -= 1);
      }
    }

    const playlistThumbNailArray = _.chain(new Object(playListThumbNailMap))
      .keys()
      .take(4)
      .value();

    playList.thumbNail = playlistThumbNailArray;
    playList.count = songCount;

    const updatedPlaylist = this.prisma.playList.update({
      where: { id: playList.id },
      data: {
        count: songCount,
        isPublic,
        playListName,
        thumbNail: playlistThumbNailArray,
        thumbNailMap: playListThumbNailMap,
        tracks: upatedTrackList,
      },
    });

    try {
      await this.prisma.$transaction([updatedPlaylist]);
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
