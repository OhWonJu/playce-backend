import { Module } from "@nestjs/common";

import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { DatabaseModule } from "@lib";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
