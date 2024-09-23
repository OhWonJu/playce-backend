import { DatabaseService } from "@lib/database/database.service";
import { Injectable } from "@nestjs/common";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { UsersService } from "../users/users.service";

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: DatabaseService,
    private usersService: UsersService,
  ) {}

  async createOrder({
    userId,
    albumIds,
    quantities,
    token,
  }: {
    userId: string;
    albumIds: string[];
    quantities: string[];
    token?: string;
  }) {
    if (albumIds.length !== quantities.length)
      return new Error("상품 정보에 이상이 있습니다.");

    await this.prisma.order.create({
      data: {
        productIds: albumIds,
        quantities: quantities.map(Number),
        progress: "CHECKING",
        token,
        userId,
      },
    });
  }

  async confirmOrder({
    userId,
    token,
  }: {
    userId: string;
    token: string;
  }): Promise<MutationResponse> {
    const order = await this.prisma.order.findUnique({
      where: {
        token,
      },
    });

    if (!order) {
      return {
        ok: false,
        error: "해당 주문 정보를 확인할 수 없습니다.",
        errorCode: 404,
      };
    }

    if (order.progress !== "CHECKING") {
      return {
        ok: false,
        error: "이미 완료된 주문입니다.",
        errorCode: 400,
      };
    }

    try {
      order.progress = "PAID";
      await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          ...order,
        },
      });

      // 테스트용
      const albumIds: string[] = [];

      for (let i = 0; i < order.productIds.length; i++) {
        for (let count = 0; count < order.quantities[i]; count++) {
          albumIds.push(order.productIds[i]);
        }
      }

      await this.usersService.createUserAlbum(userId, {
        albumIds,
        userId: userId,
      });

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: "주문 정보 갱신 중 문제가 발생했습니다.",
        errorCode: 500,
      };
    }
  }
}
