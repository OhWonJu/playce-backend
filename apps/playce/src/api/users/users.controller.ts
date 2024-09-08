/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";

import { UsersService } from "./users.service";
import { getUserProfileDTO } from "./dto/getUserProfile.DTO";
import { AuthGuard } from "../auth/auth.guard";
import { getMeDTO } from "./dto/getMe.DTO";
import { CreateUserDTO } from "@lib/crud/user/dto/createUser.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { Album, PlayList, Queue } from "@prisma/client";
import { CreatePlayListDTO } from "@lib/crud/play-list/dto/createPlayList.DTO";
import { UpdatePlayListDTO } from "@lib/crud/play-list/dto/updatePlayList.DTO";
import { UpdateQueueDTO } from "@lib/crud/queue/dto/updateQueue.DTO";
import { UpdateUserDTO } from "@lib/crud/user/dto/updateUser.DTO";
import { UNAUTHORIZED } from "utils/errorCodes";
import { GetSummaryDTO } from "./dto/getSummary.DTO";
import { getQueueDTO } from "./dto/getQueueDTO";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  // 유저 생성
  @Post("/create")
  async createUser(
    @Body() createUserDTO: CreateUserDTO,
  ): Promise<MutationResponse> {
    return await this.usersService.createUser(createUserDTO);
  }

  // 가인증 유저 최종 생성
  @UseGuards(AuthGuard)
  @Put("/create/confirm")
  async confirmCreateUser(
    @Request() req,
    @Body() updateUserDTO: UpdateUserDTO,
  ) {
    return await this.usersService.confirmCreateUser(
      req.user.sub,
      updateUserDTO,
    );
  }

  // 첫 로드에 필요한 본인 정보
  @UseGuards(AuthGuard)
  @Get("/me")
  async getMe(@Request() req): Promise<getMeDTO | undefined> {
    return await this.usersService.getMe(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Put("/logout")
  async Logout(@Request() req, @Res() res): Promise<MutationResponse> {
    const existUser = await this.usersService.getMe(req.user.sub);

    if (!existUser) {
      return {
        ok: false,
        error: UNAUTHORIZED.NOT_AUTHORIZED.message,
        errorCode: UNAUTHORIZED.NOT_AUTHORIZED.code,
      };
    }

    res.cookie("playce_access_token", "", {
      httpOnly: true,
      maxAge: 0,
    });

    res.cookie("playce_expires_at", "", {
      maxAge: 0,
    });

    res.cookie("playce_refresh_token", "", {
      httpOnly: true,
      maxAge: 0,
    });

    const result = { ok: true };
    res.send(result);
    return result;
  }

  @UseGuards(AuthGuard)
  @Get("/summary")
  async getSummary(@Request() req): Promise<GetSummaryDTO | undefined> {
    return await this.usersService.getSummary(req.user.sub);
  }

  // // 프로파일
  // @Get("/profile/:userName")
  // async getProfile(
  //   // @Request() req,
  //   @Param("userName") userName: string,
  // ): Promise<getUserProfileDTO | undefined> {
  //   return await this.usersService.getUserProfile({ userName });
  // }

  // 앨범 목록 가져오기
  @UseGuards(AuthGuard)
  @Get("/:userKey/:type/albums")
  async getUserAlbums(
    @Request() req,
    @Param("userKey") userKey: string,
    @Param("type") type: string,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("limit", new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<{ albums: Album[]; own: boolean } | undefined> {
    // front에서 앨범 상세뷰가 그려질때 상위 컴포넌트로부터 own값이 전달되면 그대로 처리
    // 그렇지 않다면 앨범 상세뷰 내에서 해당 앨범에 대한 소유 정보를 확인해서 처리 own => boolean or undefind?? when undefind 일때 own 확인..
    const realType = type === "a" ? "id" : type === "b" ? "userName" : "none";
    return await this.usersService.getUserAlbums(
      req.user.sub,
      req.user.username,
      userKey,
      realType,
      {
        offset,
        limit,
      },
    );
  }

  // // 앨범 등록하기
  // @UseGuards(AuthGuard)
  // @Post("/regist/album")
  // async registAlbum(
  //   @Request() req,
  //   @Query("albumCode") albumCode: string,
  // ): Promise<MutationResponse> {
  //   return await this.usersService.registAlbum(
  //     req.user.sub,
  //     req.user.username,
  //     albumCode,
  //   );
  // }

  // 유저 정보 수정

  // 유저 삭제

  // 플레이리스트 생성하기
  @UseGuards(AuthGuard)
  @Post("/create/playlist")
  async createPlayList(
    @Request() req,
    @Body() createPlayListDTO: CreatePlayListDTO,
  ): Promise<MutationResponse> {
    return await this.usersService.createPlayList(
      req.user.sub,
      createPlayListDTO,
    );
  }

  // 플레이리스트 목록 가져오기
  @UseGuards(AuthGuard)
  @Get("/playlist/user/:userId")
  async getAllPlayList(
    @Request() req,
    @Param("userId") userId: string,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("limit", new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<{ playlists: PlayList[]; own: boolean }> {
    return await this.usersService.getAllPlayList(req.user.sub, userId, {
      offset,
      limit,
    });
  }

  // 플레이리스트 가져오기
  @UseGuards(AuthGuard)
  @Get("/playlist/list/:playListId")
  async getPlayList(
    @Request() req,
    @Param("playListId") playListId: string,
  ): Promise<{ playList: PlayList; own: boolean }> {
    return await this.usersService.getPlayList(req.user.sub, playListId);
  }

  // 플레이리스트 수정
  @UseGuards(AuthGuard)
  @Patch("update/playlist/:playListId")
  async updatePlayList(
    @Request() req,
    @Param("playListId") playListId: string,
    @Body() updatePlayListDTO: UpdatePlayListDTO,
  ): Promise<MutationResponse> {
    return await this.usersService.updatePlayList(
      req.user.sub,
      playListId,
      updatePlayListDTO,
    );
  }

  // 플레이리스트 삭제

  // 큐 가져오기
  @UseGuards(AuthGuard)
  @Get("/queue")
  async getQueue(@Request() req): Promise<getQueueDTO> {
    return await this.usersService.getQueue(req.user.sub);
  }

  // 큐 수정
  @UseGuards(AuthGuard)
  @Patch("update/queue")
  async updateQueue(
    @Request() req,
    @Body() updateQueueDTO: UpdateQueueDTO,
  ): Promise<MutationResponse> {
    return await this.usersService.updateQueue(req.user.sub, updateQueueDTO);
  }
}
