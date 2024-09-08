import { Injectable } from "@nestjs/common";

import { DatabaseService } from "@lib/database/database.service";
import { Account, Prisma } from "@prisma/client";

import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { CreateAccountDTO } from "./dto/createAccount.DTO";
import { INTERNAL_ERROR } from "utils/errorCodes";

@Injectable()
export class AccountService {
  constructor(private prisma: DatabaseService) {}

  private async saveAccount(
    createAccountDTO: CreateAccountDTO,
  ): Promise<any | null> {
    const newAccount = this.prisma.account.create({
      data: createAccountDTO,
    });

    const result = await this.prisma.$transaction([newAccount]);

    return result[0];
  }

  async createAccount(
    createAccountDTO: CreateAccountDTO,
  ): Promise<MutationResponse> {
    const existAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: createAccountDTO.provider,
          providerAccountId: createAccountDTO.provider,
        },
      },
    });

    if (existAccount) {
      return {
        ok: true,
        data: existAccount,
      };
    }

    const newAccount = await this.saveAccount(createAccountDTO);

    if (newAccount) {
      return {
        ok: true,
        data: newAccount,
      };
    } else {
      return { ok: false, error: "create new account faild" };
    }
  }

  async findAccount(
    accountWhereUniqueInput: Prisma.AccountWhereUniqueInput,
    // provider: string,
    // providerAccountId: string,
  ): Promise<Account | null> {
    return await this.prisma.account.findUnique({
      where: accountWhereUniqueInput,
    });
  }

  async updateAccount(account: Account): Promise<MutationResponse> {
    const updatedAccount = await this.prisma.account.update({
      where: {
        id: account.id,
      },
      data: { ...account },
    });

    if (updatedAccount) {
      return { ok: true };
    } else
      return {
        ok: false,
        error: INTERNAL_ERROR.message,
        errorCode: INTERNAL_ERROR.code,
      };
  }
}
