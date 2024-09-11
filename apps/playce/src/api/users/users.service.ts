import { Injectable } from "@nestjs/common";
import { Album, PlayList, Prisma, Queue, Track } from "@prisma/client";
import * as _ from "lodash";

import { UserService } from "@lib/crud/user/user.service";
import { CreateUserDTO } from "@lib/crud/user/dto/createUser.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";

import { getUserProfileDTO } from "./dto/getUserProfile.DTO";
import { AlbumService } from "@lib/crud/album/album.service";
import { GetAlbumsDTO } from "@lib/crud/album/dto/getAlbums.DTO";
import { CreatePlayListDTO } from "@lib/crud/play-list/dto/createPlayList.DTO";
import { PlayListService } from "@lib/crud/play-list/play-list.service";
import { GetPlayListsDTO } from "@lib/crud/play-list/dto/getPlayLists.DTO";
import { UpdatePlayListDTO } from "@lib/crud/play-list/dto/updatePlayList.DTO";
import { QueueService } from "@lib/crud/queue/queue.service";
import { UpdateQueueDTO } from "@lib/crud/queue/dto/updateQueue.DTO";
import { UpdateUserDTO } from "@lib/crud/user/dto/updateUser.DTO";
import { GetSummaryDTO } from "./dto/getSummary.DTO";
import { DatabaseService } from "@lib/database/database.service";
import { getQueueDTO } from "./dto/getQueueDTO";
import { GetPlaylistsResponse } from "./dto/getPlaylistsResponse";

@Injectable()
export class UsersService {
  constructor(
    private prisma: DatabaseService,
    private userService: UserService,
    private albumService: AlbumService,
    private playListService: PlayListService,
    private queueService: QueueService,
  ) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<MutationResponse> {
    return await this.userService.createUser(createUserDTO);
  }

  async confirmCreateUser(
    userId: string,
    updateUserDTO: UpdateUserDTO,
  ): Promise<MutationResponse> {
    return await this.userService.updateUser({ id: userId }, updateUserDTO);
  }

  async getMe(userId: string) {
    return await this.userService.getMe({ id: userId });
  }

  // async getUserProfile(
  //   userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  // ): Promise<getUserProfileDTO | undefined> {
  //   const profile = await this.userService.findUserWithOutPrivate(
  //     userWhereUniqueInput,
  //   );

  //   return profile;
  // }

  async getSummary(userId: string): Promise<GetSummaryDTO> {
    const userAlbums = await this.prisma.album.findMany({
      where: { users: { some: { id: userId } } },
      select: {
        id: true,
        albumName: true,
        albumArtURL: true,
        artist: {
          select: {
            artistName: true,
          },
        },
      },
      take: 20,
    });

    const userPlayList = await this.prisma.playList.findMany({
      where: { userId },
      select: {
        id: true,
        playListName: true,
        thumbNail: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const result: GetSummaryDTO = {
      myAlbums: userAlbums,
      myPlayList: userPlayList,
    };

    return result;
  }

  async getUserAlbums(
    myId: string,
    myName: string,
    userKey: string,
    type: "id" | "userName" | "none",
    option: GetAlbumsDTO,
  ): Promise<{ albums: Album[]; own: boolean } | undefined> {
    if (type === "none") return;

    const checkMe =
      type === "id"
        ? myId === userKey
        : type === "userName"
        ? myName === userKey
        : false;

    const own = checkMe;

    const albums = await this.albumService.getAlbumsByUser(
      userKey,
      type,
      option,
    );

    return {
      albums,
      own,
    };
  }

  // async registAlbum(
  //   userId: string,
  //   userName: string,
  //   albumCode: string,
  // ): Promise<MutationResponse> {
  //   const checkMe = (await this.getMe(userId)).userName === userName;

  //   if (checkMe) {
  //     return await this.albumService.registUser(userId, albumCode);
  //   }
  // }

  async createPlayList(
    userId: string,
    createPlayListDTO: CreatePlayListDTO,
  ): Promise<MutationResponse> {
    createPlayListDTO.userId = userId;

    return await this.playListService.createPlayList(createPlayListDTO);
  }

  async getAllPlayList(
    myId: string,
    userId: string,
    option: GetPlayListsDTO,
  ): Promise<GetPlaylistsResponse> {
    // const own = myId === userId;

    return await this.playListService.getAllPlayList(userId, option);
  }

  async getPlayList(
    myId: string,
    playListId: string,
  ): Promise<{ playlist: PlayList; own: boolean }> {
    const playlist = await this.playListService.getPlayList(playListId);

    const own = playlist.userId === myId;

    return {
      playlist,
      own,
    };
  }

  async getPlayListTracks(
    myId: string,
    playlistId: string,
  ): Promise<{ playlistId: string; tracks: Track[]; own: boolean }> {
    const playlist = await this.playListService.getTracksByPlaylist(playlistId);

    const own = playlist.userId === myId;

    return {
      playlistId: playlist.id,
      tracks: playlist.tracks,
      own,
    };
  }

  async updatePlayList(
    myId: string,
    playListId: string,
    UpdatePlayListDTO: UpdatePlayListDTO,
  ): Promise<MutationResponse> {
    return await this.playListService.updatePlayList(
      playListId,
      myId,
      UpdatePlayListDTO,
    );
  }

  async getQueue(myId: string): Promise<getQueueDTO> {
    const queue = await this.queueService.getQueue(myId);
    const queueThumbNailArray = _.chain(new Object(queue.queueThumbNail))
      .keys()
      .take(4)
      .value();

    queue.queueThumbNail = queueThumbNailArray;

    return {
      ...queue,
      queueThumbNail: queueThumbNailArray,
    };
  }

  async updateQueue(
    myId: string,
    UpdateQueueDTO: UpdateQueueDTO,
  ): Promise<MutationResponse> {
    return await this.queueService.updateQueue(myId, UpdateQueueDTO);
  }
}
