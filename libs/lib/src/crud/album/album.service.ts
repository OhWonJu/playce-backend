import { Injectable } from "@nestjs/common";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";

import { CreateAlbumDTO } from "./dto/createAlbum.DTO";
import { Album, Prisma } from "@prisma/client";
import { GetAlbumsDTO } from "./dto/getAlbums.DTO";

@Injectable()
export class AlbumService {
  constructor(private prisma: DatabaseService) {}

  private async saveAlbum(createAlbumDTO: CreateAlbumDTO) {
    const {
      albumArtURL,
      albumCode,
      albumInfo,
      albumName,
      artistId,
      albumType,
    } = createAlbumDTO;

    const newAlbum = this.prisma.album.create({
      data: {
        artistId,
        albumArtURL,
        albumCode,
        albumName,
        albumType,
        albumInfo,
      },
    });

    await this.prisma.$transaction([newAlbum]);
  }

  async albumCodeCheck(
    albumCode: string,
    type: "exist" | "validation",
  ): Promise<boolean> {
    const exist = await this.prisma.album.findUnique({
      where: {
        albumCode,
      },
    });

    if (type === "exist") return exist ? false : true;
    else if (type === "validation") return exist ? true : false;
  }

  async createAlbum(createAlbumDTO: CreateAlbumDTO): Promise<MutationResponse> {
    const { albumCode } = createAlbumDTO;

    const check = await this.albumCodeCheck(albumCode, "exist");

    if (check) {
      await this.saveAlbum(createAlbumDTO);
      return {
        ok: true,
      };
    } else {
      return {
        ok: false,
        error: "unique key exist",
      };
    }
  }

  async getAlbum(
    albumWhereUniqueInput: Prisma.AlbumWhereUniqueInput,
  ): Promise<Album | undefined> {
    return await this.prisma.album.findUnique({
      where: albumWhereUniqueInput,
      include: {
        tracks: {
          orderBy: {
            trackNumber: "asc",
          },
        },
        genres: { select: { id: true, genre: true } },
        artist: { select: { artistInfo: true, artistName: true, id: true } },
      },
    });
  }

  async getAlbumOwnership(userId: string, albumId: string): Promise<boolean> {
    const hasAlbum = await this.prisma.album.findFirst({
      where: {
        id: albumId,
        users: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (hasAlbum) return true;
    else return false;
  }

  async getAlbumsByArtist(artistId: string): Promise<Album[] | undefined> {
    return await this.prisma.album.findMany({
      where: {
        artistId,
      },
    });
  }

  async getAlbumsByUser(
    userKey: string,
    type: "id" | "userName",
    option: GetAlbumsDTO,
  ): Promise<Album[] | undefined> {
    const { offset, limit } = option;

    if (type === "id") {
      return await this.prisma.album.findMany({
        where: {
          users: {
            some: {
              id: userKey,
            },
          },
        },
        include: { artist: { select: { artistName: true } } },
        skip: offset,
        take: limit,
      });
    } else if (type === "userName") {
      return await this.prisma.album.findMany({
        where: {
          users: {
            some: { userName: userKey },
          },
        },
        skip: offset,
        take: limit,
      });
    }
  }

  async registUser(
    userId: string,
    albumCode: string,
  ): Promise<MutationResponse> {
    const updateAlbum = this.prisma.album.update({
      where: {
        albumCode,
      },
      data: {
        users: {
          connect: { id: userId },
        },
      },
    });

    try {
      await this.prisma.$transaction([updateAlbum]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: "failed regist album: " + error,
      };
    }
  }
}
