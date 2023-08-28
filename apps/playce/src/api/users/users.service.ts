import { Injectable } from "@nestjs/common";
import { Album, PlayList, Prisma, Queue } from "@prisma/client";

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

@Injectable()
export class UsersService {
  constructor(
    private userService: UserService,
    private albumService: AlbumService,
    private playListService: PlayListService,
    private queueService: QueueService,
  ) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<MutationResponse> {
    return await this.userService.createUser(createUserDTO);
  }

  async getMe(userId: string) {
    return await this.userService.getMe({ id: userId });
  }

  async getUserProfile(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<getUserProfileDTO | undefined> {
    const profile = await this.userService.findUserWithOutPrivate(
      userWhereUniqueInput,
    );

    return profile;
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

  async registAlbum(
    userId: string,
    userName: string,
    albumCode: string,
  ): Promise<MutationResponse> {
    const checkMe = (await this.getMe(userId)).userName === userName;

    if (checkMe) {
      return await this.albumService.registUser(userId, albumCode);
    }
  }

  async createPlayList(
    userId: string,
    CreatePlayListDTO: CreatePlayListDTO,
  ): Promise<MutationResponse> {
    CreatePlayListDTO.userId = userId;
    // console.log(CreatePlayListDTO);

    return await this.playListService.createPlayList(CreatePlayListDTO);
  }

  async getAllPlayList(
    myId: string,
    userId: string,
    option: GetPlayListsDTO,
  ): Promise<{ playlists: PlayList[]; own: boolean }> {
    const own = myId === userId;

    const playlists = await this.playListService.getAllPlayList(userId, option);

    return {
      playlists: playlists,
      own,
    };
  }

  async getPlayList(
    myId: string,
    playListId: string,
  ): Promise<{ playList: PlayList; own: boolean }> {
    const playList = await this.playListService.getPlayList(playListId);

    const own = playList.userId === myId;

    return {
      playList,
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

  async getQueue(myId: string): Promise<Queue> {
    return await this.queueService.getQueue(myId);
  }

  async updateQueue(
    myId: string,
    UpdateQueueDTO: UpdateQueueDTO,
  ): Promise<MutationResponse> {
    return await this.queueService.updateQueue(myId, UpdateQueueDTO);
  }
}
