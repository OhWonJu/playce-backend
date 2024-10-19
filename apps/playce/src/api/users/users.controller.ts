/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";

import { UsersService } from "./users.service";
import { AuthGuard } from "../auth/auth.guard";
import { getMeDTO } from "./dto/getMe.DTO";
import { CreateUserDTO } from "@lib/crud/user/dto/createUser.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { PlayList } from "@prisma/client";
import { CreatePlayListDTO } from "@lib/crud/play-list/dto/createPlayList.DTO";
import { UpdatePlayListDTO } from "@lib/crud/play-list/dto/updatePlayList.DTO";
import { UpdateQueueDTO } from "@lib/crud/queue/dto/updateQueue.DTO";
import { UpdateUserDTO } from "@lib/crud/user/dto/updateUser.DTO";
import { UNAUTHORIZED } from "utils/errorCodes";
import { GetSummaryDTO } from "./dto/getSummary.DTO";
import { getQueueDTO } from "./dto/getQueueDTO";
import { GetPlaylistsResponse } from "./dto/getPlaylistsResponse";
import { GetUserAlbumsResponse } from "./dto/getAlbumsResponse";
import { CreateUserAlbumDTO } from "@lib/crud/user/dto/createUserAlbum.DTO";
import { ConfigService } from "@nestjs/config";

@Controller("users")
export class UsersController {
  constructor(
    private usersService: UsersService,
    private configServie: ConfigService,
  ) {}

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
    const CLIENT_URL = this.configServie.get("CLIENT_URL");
    const CLIENT_DOMAIN = this.configServie.get("CLIENT_DOMAIN");

    const existUser = await this.usersService.getMe(req.user.sub);

    if (!existUser) {
      return {
        ok: false,
        error: UNAUTHORIZED.NOT_AUTHORIZED.message,
        errorCode: UNAUTHORIZED.NOT_AUTHORIZED.code,
      };
    }

    res.cookie("playce_access_token", "", {
      domain: CLIENT_DOMAIN,
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      maxAge: 0,
    });

    res.cookie("playce_refresh_token", "", {
      domain: CLIENT_DOMAIN,
      secure: true,
      sameSite: "strict",
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

  // 나의 앨범 목록 가져오기
  @UseGuards(AuthGuard)
  @Get("/:userId/albums")
  async getUserAlbums(
    @Request() req,
    @Param("userId") userId: string,
    @Query("cursor") cursor: string,
  ): Promise<GetUserAlbumsResponse> {
    return await this.usersService.getUserAlbums(req.user.sub, userId, {
      cursor,
    });
  }

  // User Album 생성
  @UseGuards(AuthGuard)
  @Post("/create/userAlbum")
  async createUserAlbum(
    @Request() req,
    @Body() createUserAlbumDTO: CreateUserAlbumDTO,
  ): Promise<MutationResponse> {
    return await this.usersService.createUserAlbum(
      req.user.sub,
      createUserAlbumDTO,
    );
  }

  // 유저 정보 수정

  // 유저 삭제
  @UseGuards(AuthGuard)
  @Put("/delete/user")
  async deleteUser(@Request() req, @Res() res): Promise<MutationResponse> {
    await this.Logout(req, res);

    // DEMO-USER
    if (req.user.sub === "demo-user") return { ok: true };

    return await this.usersService.deleteUser(req.user.sub);
  }

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
  @Get("/playlist/:userId")
  async getAllPlayList(
    @Request() req,
    @Param("userId") userId: string,
    @Query("cursor") cursor: string,
  ): Promise<GetPlaylistsResponse> {
    return await this.usersService.getAllPlayList(req.user.sub, userId, {
      cursor,
    });
  }

  @UseGuards(AuthGuard)
  @Put("/playlist/tracks/:playListId")
  async getPlayListTracks(
    @Request() req,
    @Param("playListId") playListId: string,
  ): Promise<{ playlistId: string; own: boolean }> {
    return await this.usersService.getPlayListTracks(req.user.sub, playListId);
  }

  // 플레이리스트 가져오기
  @UseGuards(AuthGuard)
  @Get("/playlist/list/:playListId")
  async getPlayList(
    @Request() req,
    @Param("playListId") playListId: string,
  ): Promise<{ playlist: PlayList; own: boolean }> {
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
