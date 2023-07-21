import { CreateTrackDTO } from "@lib/crud/track/dto/createTrack.DTO";
import { TracksService } from "./tracks.service";

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { FileInterceptor } from "@nestjs/platform-express";
import { Track } from "@prisma/client";

@Controller("tracks")
export class TracksController {
  constructor(private tracksService: TracksService) {}

  // 트랙 정보 생성
  @Post("/create")
  @UseInterceptors(FileInterceptor("file"))
  async createTrack(
    @UploadedFile() file,
    @Body() createTrackDTO: CreateTrackDTO,
  ): Promise<MutationResponse> {
    return await this.tracksService.createTrack(file, createTrackDTO);
  }

  // 트랙 정보 가져오기
  @Get("/:trackId")
  async getTrackInfo(
    @Param("trackId") trackId: string,
  ): Promise<Track | undefined> {
    return await this.tracksService.getTrackInfo(trackId);
  }

  // 트랙 정보 수정
  // 트랙 삭제
}
