import { Injectable } from "@nestjs/common";
import { UserAlbum } from "@prisma/client";
import * as crypto from "crypto";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { CreateUserAlbumDTO } from "./dto/createUserAlbum.DTO";
import { randomUUID } from "crypto";
import { UserService } from "./user.service";
import { GetAlbumsDTO } from "../album/dto/getAlbums.DTO";
import { GetAlbumsResponse } from "apps/playce/src/api/users/dto/getAlbumsResponse";

@Injectable()
export class UserAlbumService {
  constructor(
    private prisma: DatabaseService,
    private userService: UserService,
  ) {}

  private albumsBatch = 15;

  private generateAlbumCode(): string {
    const uuid = randomUUID();

    // UUID를 UTF-8 기반 바이트 배열로 변환
    const uuidBytes = Buffer.from(uuid, "utf-8");

    // SHA-256 해시 함수로 변환
    const hash = crypto.createHash("sha256").update(uuidBytes).digest();

    // 해시 값의 앞 4바이트를 16진수로 변환하여 8자리 문자열로 변환
    const albumCode = hash.toString("hex").slice(0, 8);

    return albumCode;
  }

  private async saveUserAlbum(
    createUserAlbumDTO: CreateUserAlbumDTO,
  ): Promise<UserAlbum[] | null> {
    const { albumIds, userId } = createUserAlbumDTO;

    const newUserAlbumsData = albumIds.map((albumId) => ({
      albumCode: this.generateAlbumCode(),
      userId: userId,
      albumId,
    }));

    return await this.prisma.$transaction(
      newUserAlbumsData.map((data) => this.prisma.userAlbum.create({ data })),
    );
    // const result = await this.prisma.$transaction([newUserAlbums]);
  }

  async createUserAlbum(
    createUserAlbumDTO: CreateUserAlbumDTO,
  ): Promise<MutationResponse> {
    const { userId } = createUserAlbumDTO;

    const newUserAlbums = await this.saveUserAlbum(createUserAlbumDTO);

    if (!newUserAlbums) {
      return {
        ok: false,
        errorCode: 500,
        error: "failed create new user album",
      };
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        userAlbumIds: true,
      },
    });

    try {
      const newUserAlbmIdsSet = new Set(user.userAlbumIds);
      newUserAlbums.forEach(async (newUserAlbum) => {
        newUserAlbmIdsSet.add(newUserAlbum.albumId);
      });

      await this.userService.updateUser(
        { id: userId },
        {
          userAlbumIds: [...newUserAlbmIdsSet],
          name: undefined,
          nickName: undefined,
          email: undefined,
          phoneNumber: undefined,
          image: undefined,
          hashedPassword: undefined,
        },
      );

      return {
        ok: true,
        data: newUserAlbums,
      };
    } catch (error) {
      return {
        ok: false,
        errorCode: 500,
        error: "failed update userAlbumIds",
      };
    }
  }

  // async getAlbumsByUser(
  //   userId: string,
  //   option: GetAlbumsDTO,
  // ): Promise<GetAlbumsResponse> {
  //   const { cursor } = option;

  //   const userAlbums = await this.prisma.userAlbum.findMany({
  //     where: {
  //       userId: userId,
  //     },
  //     take: this.albumsBatch,
  //     ...(cursor && {
  //       skip: 1,
  //       cursor: {
  //         id: cursor,
  //       },
  //     }),
  //   });

  //   const albumIds = userAlbums.map((album) => album.id);

  //   const albums = await this.prisma.album.findMany({
  //     where: { id: { in: albumIds } },
  //     include: {
  //       artist: {
  //         select: {
  //           artistName: true,
  //         },
  //       },
  //     },
  //   });

  //   let nextCursor = null;

  //   if (userAlbums.length === this.albumsBatch) {
  //     nextCursor = userAlbums[this.albumsBatch - 1].id;
  //   }

  //   return {
  //     albums,
  //     nextCursor,
  //   };
  // }

  async getAlbumOwnership(userId: string, albumId: string): Promise<boolean> {
    const hasAlbum = await this.prisma.userAlbum.findFirst({
      where: {
        albumId: albumId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (hasAlbum) return true;
    else return false;
  }
}
