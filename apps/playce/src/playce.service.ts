import { Injectable } from "@nestjs/common";

@Injectable()
export class PlayceService {
  getHello(): string {
    return "Hello World!";
  }
}
