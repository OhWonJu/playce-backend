import { Injectable } from "@nestjs/common";
import { Artist } from "@prisma/client";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { CreateArtistDTO } from "./dto/createArtist.DTO";

@Injectable()
export class ArtistService {
  constructor(private prisma: DatabaseService) {}

  private async saveArtist(createArtistDTO: CreateArtistDTO) {
    const { artistInfo, artistName } = createArtistDTO;

    const newArtist = this.prisma.artist.create({
      data: {
        artistName,
        artistInfo,
      },
    });

    await this.prisma.$transaction([newArtist]);
  }

  private async ArtistCheck(artistName: string): Promise<boolean> {
    const exist = await this.prisma.artist.findUnique({
      where: { artistName },
    });

    return exist ? false : true;
  }

  async createArtist(
    createArtistDTO: CreateArtistDTO,
  ): Promise<MutationResponse> {
    const { artistName } = createArtistDTO;

    const existCheck = await this.ArtistCheck(artistName);

    if (existCheck) {
      await this.saveArtist(createArtistDTO);
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

  async getArtist(artistName: string): Promise<Artist | undefined> {
    return await this.prisma.artist.findUnique({
      where: { artistName },
    });
  }
}
