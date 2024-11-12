import { Injectable } from "@nestjs/common";
import { Order } from "@prisma/client";

import { DatabaseService } from "@lib/database/database.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";

import { CreateOrderDTO } from "./dto/createOrder.DTO";

@Injectable()
export class OrderService {
  constructor(private prisma: DatabaseService) {}

  private async saveOrder(
    createOrderDTO: CreateOrderDTO,
  ): Promise<Order | null> {
    const newOrder = this.prisma.order.create({
      data: createOrderDTO,
    });

    const result = await this.prisma.$transaction([newOrder]);

    return result[0];
  }

  async createOrder(createOrderDTO: CreateOrderDTO): Promise<MutationResponse> {
    // TODO 오더 정보 정합석 확인 로직 필요

    const newOrder = await this.saveOrder(createOrderDTO);

    if (newOrder) {
      return {
        ok: true,
        data: newOrder,
      };
    }
  }

  async getAllOrderByUser(userId: string) {
    return await this.prisma.order.findMany({
      where: { userId },
    });
  }
}
