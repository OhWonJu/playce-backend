import { Injectable } from "@nestjs/common";

@Injectable()
export class PlayceService {
  connectCheck(): { ok: boolean } {
    return { ok: true };
  }
}
