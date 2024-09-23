import { Injectable } from "@nestjs/common";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";

import { CreateAlbumDTO } from "./dto/createAlbum.DTO";
import { Album, Prisma } from "@prisma/client";
import { GetAlbumsDTO } from "./dto/getAlbums.DTO";
import { GetAlbumsResponse } from "apps/playce/src/api/users/dto/getAlbumsResponse";

@Injectable()
export class AlbumService {
  constructor(private prisma: DatabaseService) {}

  private albumsBatch = 15;

  private async saveAlbum(createAlbumDTO: CreateAlbumDTO) {
    const {
      albumArtURL,
      albumCode,
      albumInfo,
      albumName,
      artistId,
      albumType,
      price,
    } = createAlbumDTO;

    const newAlbum = this.prisma.album.create({
      data: {
        artistId,
        albumArtURL,
        albumCode,
        albumName,
        albumType,
        albumInfo,
        price,
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

  async getAlbumsByArtist(artistId: string): Promise<Album[] | undefined> {
    return await this.prisma.album.findMany({
      where: {
        artistId,
      },
    });
  }

  // async registUser(
  //   userId: string,
  //   albumCode: string,
  // ): Promise<MutationResponse> {
  //   const updateAlbum = this.prisma.album.update({
  //     where: {
  //       albumCode,
  //     },
  //     data: {
  //       users: {
  //         connect: { id: userId },
  //       },
  //     },
  //   });

  //   try {
  //     await this.prisma.$transaction([updateAlbum]);
  //     return {
  //       ok: true,
  //     };
  //   } catch (error) {
  //     return {
  //       ok: false,
  //       error: "failed regist album: " + error,
  //     };
  //   }
  // }

  async getAllAlbum(): Promise<Album[]> {
    return await this.prisma.album.findMany({
      include: { artist: { select: { artistName: true } } },
    });
  }
}
