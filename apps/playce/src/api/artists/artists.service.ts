import { Injectable } from "@nestjs/common";

import { ArtistService } from "@lib/crud/artist/artist.service";
import { CreateArtistDTO } from "@lib/crud/artist/dto/createArtist.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { Artist } from "@prisma/client";

@Injectable()
export class ArtistsService {
  constructor(private artistService: ArtistService) {}

  async createArtist(
    createArtistDTO: CreateArtistDTO,
  ): Promise<MutationResponse> {
    return await this.artistService.createArtist(createArtistDTO);
  }

  async getArtistInfo(artistName: string): Promise<Artist | undefined> {
    return await this.artistService.getArtist(artistName);
  }
}
