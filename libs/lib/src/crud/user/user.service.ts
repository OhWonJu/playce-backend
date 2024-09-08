import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";

import { getMeDTO } from "apps/playce/src/api/users/dto/getMe.DTO";
import { getUserProfileDTO } from "apps/playce/src/api/users/dto/getUserProfile.DTO";
import { CreateUserDTO } from "./dto/createUser.DTO";
import { UpdateUserDTO } from "./dto/updateUser.DTO";
import { INTERNAL_ERROR } from "utils/errorCodes";

@Injectable()
export class UserService {
  constructor(private prisma: DatabaseService) {}

  private async saveUser(createUserDTO: CreateUserDTO): Promise<any | null> {
    const newUser = this.prisma.user.create({
      data: createUserDTO,
    });

    const result = await this.prisma.$transaction([newUser]);

    return result[0];
  }

  async uniqueKeyCheck(
    data: string | undefined,
    type: "email" | "userName" | "phoneNumber",
  ): Promise<boolean> {
    if (!data) return false;

    const checking = {
      email: await this.prisma.user.findUnique({
        where: { email: data },
      }),
      // userName: await this.prisma.user.findUnique({
      //   where: { userName: data },
      // }),
      // phoneNumber: await this.prisma.user.findUnique({
      //   where: { phoneNumber: data },
      // }),
    };

    const existCheck = checking[type];

    return existCheck ? false : true;
  }

  async createUser(createUserDTO: CreateUserDTO): Promise<MutationResponse> {
    const { email } = createUserDTO;

    const [emailCheck] = await Promise.all([
      this.uniqueKeyCheck(email, "email"),
    ]);

    console.log(emailCheck);

    if (emailCheck) {
      const newUser = await this.saveUser(createUserDTO);

      return {
        ok: true,
        data: newUser,
      };
    } else return { ok: false, error: "create new user faild" };
  }

  async createTempUser(
    createUserDTO: CreateUserDTO,
  ): Promise<MutationResponse> {
    const newUser = await this.saveUser(createUserDTO);

    if (newUser) {
      return {
        ok: true,
        data: newUser,
      };
    } else return { ok: false, error: "create new user faild" };
  }

  async updateUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    updateUserDTO: UpdateUserDTO,
  ): Promise<MutationResponse> {
    const updatedUser = await this.prisma.user.update({
      where: userWhereUniqueInput,
      data: { ...updateUserDTO },
    });

    if (updatedUser) {
      return {
        ok: true,
      };
    } else {
      return {
        ok: false,
        error: INTERNAL_ERROR.message,
        errorCode: INTERNAL_ERROR.code,
      };
    }
  }

  async getMe(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<getMeDTO | undefined> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        id: true,
        nickName: true,
        currentPlayListId: true,
        currentPlayTime: true,
        currentTrackId: true,
        image: true,
      },
      // include: { albums: true, playLists: true },
    });
  }

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  // async findUserWithOutPrivate(
  //   userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  // ): Promise<getUserProfileDTO | null> {
  //   return await this.prisma.user.findUnique({
  //     where: userWhereUniqueInput,
  //     select: {
  //       id: true,
  //       firstName: true,
  //       lastName: true,
  //       userName: true,
  //       bio: true,
  //       profilePhoto: true,
  //       createdAt: true,
  //     },
  //   });
  // }
}
