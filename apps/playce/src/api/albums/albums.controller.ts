import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import { AlbumsService } from "./albums.service";
import { CreateAlbumDTO } from "@lib/crud/album/dto/createAlbum.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { FileInterceptor } from "@nestjs/platform-express";
import { Album } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { Public } from "utils/decorators/public";

@Controller("albums")
export class AlbumsController {
  constructor(private albumsService: AlbumsService) {}

  // 앨범 생성
  @Post("/create")
  @UseInterceptors(FileInterceptor("file"))
  async createUser(
    @UploadedFile() file,
    @Body() createAlbumDTO: CreateAlbumDTO,
  ): Promise<MutationResponse> {
    return await this.albumsService.createAlbum(file, createAlbumDTO);
  }

  // 엘범 정보 가져오기 (트랙 정보 포함)
  @Public()
  @UseGuards(AuthGuard)
  @Get("/:albumId")
  async getAlbumInfo(
    @Request() req,
    @Param("albumId") albumId: string,
  ): Promise<{ album: Album; own: boolean } | undefined> {
    return await this.albumsService.getAlbumInfo(
      req.user?.sub ?? null,
      albumId,
    );
  }

  // 앨범 수정
  // 엘범 삭제
}
