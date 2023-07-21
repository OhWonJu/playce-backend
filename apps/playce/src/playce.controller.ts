import { Controller, Get } from "@nestjs/common";
import { PlayceService } from "./playce.service";

@Controller()
export class PlayceController {
  constructor(private readonly playceService: PlayceService) {}

  @Get()
  getHello(): string {
    return this.playceService.getHello();
  }
}
