import { Track } from "@prisma/client";

export class getQueueDTO {
  id: string;
  queueThumbNail: string[];
  songCount: number;
  totalPlayTime: number;
  tracks: any[];
  userId: string;
}
