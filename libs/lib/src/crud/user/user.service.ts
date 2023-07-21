import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";

import { getMeDTO } from "apps/playce/src/api/users/dto/getMe.DTO";
import { getUserProfileDTO } from "apps/playce/src/api/users/dto/getUserProfile.DTO";
import { CreateUserDTO } from "./dto/createUser.DTO";

@Injectable()
export class UserService {
  constructor(private prisma: DatabaseService) {}

  private async saveUser(createUserDTO: CreateUserDTO) {
    const { email, firstName, lastName, password, phoneNumber, userName } =
      createUserDTO;

    const newUser = this.prisma.user.create({
      data: { email, firstName, lastName, password, phoneNumber, userName },
    });

    await this.prisma.$transaction([newUser]);
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
      userName: await this.prisma.user.findUnique({
        where: { userName: data },
      }),
      phoneNumber: await this.prisma.user.findUnique({
        where: { phoneNumber: data },
      }),
    };

    const existCheck = checking[type];

    return existCheck ? false : true;
  }

  async createUser(createUserDTO: CreateUserDTO): Promise<MutationResponse> {
    const { email, userName } = createUserDTO;

    const [emailCheck, userNameCheck] = await Promise.all([
      this.uniqueKeyCheck(email, "email"),
      this.uniqueKeyCheck(userName, "userName"),
    ]);

    if (emailCheck && userNameCheck) {
      await this.saveUser(createUserDTO);
      return {
        ok: true,
      };
    } else return { ok: false, error: "unique key exist" };
  }

  async getMe(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<getMeDTO | undefined> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        id: true,
        currentPlayListId: true,
        currentPlayTime: true,
        currentTrackId: true,
        userName: true,
        profilePhoto: true,
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

  async findUserWithOutPrivate(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<getUserProfileDTO | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        bio: true,
        profilePhoto: true,
        createdAt: true,
      },
    });
  }
}
