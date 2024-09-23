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
import { GetUserAlbumsResponse } from "./dto/getAlbumsResponse";
import { UserAlbumService } from "@lib/crud/user/userAlbum.service";
import { CreateUserAlbumDTO } from "@lib/crud/user/dto/createUserAlbum.DTO";

@Injectable()
export class UsersService {
  constructor(
    private prisma: DatabaseService,
    private userService: UserService,
    private userAlbumService: UserAlbumService,
    private albumService: AlbumService,
    private playListService: PlayListService,
    private queueService: QueueService,
  ) {}

  private albumsBatch = 15;

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userAlbumIds: true,
      },
    });

    // 배열의 앞 20개만 가져오기
    const userAlbumIds = user?.userAlbumIds.slice(0, 20);

    const userAlbums = await this.prisma.album.findMany({
      where: {
        id: { in: userAlbumIds },
      },
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
    });

    // const userAlbums = await this.prisma.album.findMany({
    //   where: { users: { some: { id: userId } } },
    //   select: {
    //     id: true,
    //     albumName: true,
    //     albumArtURL: true,
    //     artist: {
    //       select: {
    //         artistName: true,
    //       },
    //     },
    //   },
    //   take: 20,
    // });

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
    userId: string,
    option: GetAlbumsDTO,
  ): Promise<GetUserAlbumsResponse> {
    //  const own = myId === userId;

    const { cursor } = option;

    const userAlbums = await this.prisma.userAlbum.findMany({
      where: {
        userId: userId,
      },
      take: this.albumsBatch,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
    });
    const albums = await Promise.all(
      userAlbums.map(async (userAlbum) => {
        const albumData = await this.prisma.album.findUnique({
          where: { id: userAlbum.albumId },
          include: {
            artist: {
              select: {
                artistName: true,
              },
            },
          },
        });

        return {
          id: albumData?.id,
          userAlbumId: userAlbum.id,
          albumCode: userAlbum.albumCode,
          albumName: albumData?.albumName,
          albumArtURL: albumData?.albumArtURL,
          albumType: albumData?.albumType,
          albumInfo: albumData?.albumInfo,
          artist: {
            artistName: albumData?.artist.artistName,
          },
          createdAt: userAlbum.createdAt,
          updatedAt: userAlbum.updatedAt,
        };
      }),
    );

    // const albums = await this.prisma.album.findMany({
    //   where: { id: { in: albumIds } },
    //   include: {
    //     artist: {
    //       select: {
    //         artistName: true,
    //       },
    //     },
    //   },
    // });

    let nextCursor = null;

    if (userAlbums.length === this.albumsBatch) {
      nextCursor = userAlbums[this.albumsBatch - 1].id;
    }

    return {
      albums,
      nextCursor,
    };

    // return await this.albumService.getAlbumsByUser(userId, option);
  }

  async createUserAlbum(
    userId: string,
    createUserAlbumDTO: CreateUserAlbumDTO,
  ): Promise<MutationResponse> {
    createUserAlbumDTO.userId = userId;
    return await this.userAlbumService.createUserAlbum(createUserAlbumDTO);
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
