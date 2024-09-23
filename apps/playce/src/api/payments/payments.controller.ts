import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

import { AuthGuard } from "../auth/auth.guard";
import { KakaoPaySuccessBody, KakoPayReadyBody } from "./dto/kakaoPayOrder";
import { PaymentsService } from "./payments.service";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";

@Controller("payments")
export class PaymentsController {
  constructor(
    private configService: ConfigService,
    private paymentsService: PaymentsService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("/kakao-ready")
  async paymentKakaoPayReady(@Request() req, @Body() data: KakoPayReadyBody) {
    const SECRET_KEY = this.configService.get<string>(
      "KAKAOPAY_SECRET_KEY_DEV",
    );

    try {
      const res = await axios.post(
        "https://open-api.kakaopay.com/online/v1/payment/ready",
        data.kakaoPayBody,
        {
          headers: {
            Authorization: `SECRET_KEY ${SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (res.data.tid) {
        await this.paymentsService.createOrder({
          userId: req.user.sub,
          albumIds: data.albumIds,
          quantities: data.quantities,
          token: res.data.tid,
        });
      }

      return res.data;
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post("/kakao-success")
  async paymentKakaoPaySuccess(
    @Request() req,
    @Body() data: KakaoPaySuccessBody,
  ): Promise<MutationResponse> {
    const SECRET_KEY = this.configService.get<string>(
      "KAKAOPAY_SECRET_KEY_DEV",
    );

    try {
      const res = await axios.post(
        "https://open-api.kakaopay.com/online/v1/payment/approve",
        {
          cid: "TC0ONETIME",
          partner_order_id: "partner_order_id",
          partner_user_id: "partner_user_id",
          pg_token: data.pg_token,
          tid: data.tid,
        },
        {
          headers: {
            Authorization: `SECRET_KEY ${SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (res.data.aid) {
        return await this.paymentsService.confirmOrder({
          userId: req.user.sub,
          token: data.tid,
        });
      }

      return {
        ok: false,
        error: "결제에 실패했습니다.",
        errorCode: 500,
      };
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
  }
}
