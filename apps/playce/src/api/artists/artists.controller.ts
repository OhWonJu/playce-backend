import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { ArtistsService } from "./artists.service";
import { CreateArtistDTO } from "@lib/crud/artist/dto/createArtist.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { Artist } from "@prisma/client";

@Controller("artists")
export class ArtistsController {
  constructor(private artistsService: ArtistsService) {}

  // 아티스트 정보 생성
  @Post("/create")
  async createArtist(
    @Body() createArtistDTO: CreateArtistDTO,
  ): Promise<MutationResponse> {
    return await this.artistsService.createArtist(createArtistDTO);
  }

  // 아티스트 프로필 가져오기
  @Get("/:artistName")
  async getArtistInfo(
    @Param("artistName") artistName: string,
  ): Promise<Artist | undefined> {
    return await this.artistsService.getArtistInfo(artistName);
  }

  // 아티스트 앨범 목록 가져오기
  // 아티스트 정보 수정
  // 아티스트 삭제
}
