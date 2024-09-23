import { Album } from "@prisma/client";

export interface GetUserAlbumsResponse {
  albums: {
    id: string;
    userAlbumId: string;
    albumCode: string;
    albumName: string;
    albumArtURL: string;
    albumType: string;
    albumInfo?: string;
    artist: {
      artistName: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }[];
  nextCursor?: string;
}

export interface GetAlbumsResponse {
  albums: Album[];
  nextCursor?: string;
}
