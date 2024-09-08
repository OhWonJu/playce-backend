import { Controller, Get } from "@nestjs/common";
import { PlayceService } from "./playce.service";

@Controller()
export class PlayceController {
  constructor(private readonly playceService: PlayceService) {}

  @Get()
  connectCheck(): { ok: boolean } {
    return this.playceService.connectCheck();
  }
}
