import { Injectable } from "@nestjs/common";
import { Album } from "@prisma/client";

import { AlbumService } from "@lib/crud/album/album.service";
import { CreateAlbumDTO } from "@lib/crud/album/dto/createAlbum.DTO";
import { MutationResponse } from "utils/decorators/types/mutationResopnse";
import { UploadsService } from "@lib/uploads/uploads.service";

@Injectable()
export class AlbumsService {
  constructor(
    private albumService: AlbumService,
    private uploadsService: UploadsService,
  ) {}

  async createAlbum(
    file: any,
    createAlbumDTO: CreateAlbumDTO,
  ): Promise<MutationResponse> {
    const { artistName, albumName } = createAlbumDTO;
    const folderName = "artist/" + artistName + "/" + albumName;

    const s3Url = await this.uploadsService.uploadToS3(file, folderName);

    createAlbumDTO.albumArtURL = s3Url;

    return await this.albumService.createAlbum(createAlbumDTO);
  }

  async getAlbumInfo(
    userId: string,
    albumId: string,
  ): Promise<{ album: Album; own: boolean } | undefined> {
    const album = await this.albumService.getAlbum({ id: albumId });
    const ownerShip = userId
      ? await this.albumService.getAlbumOwnership(userId, album.id)
      : false;

    return {
      album,
      own: ownerShip,
    };
  }

  async getAllAlbum(): Promise<Album[]> {
    return await this.albumService.getAllAlbum();
  }
}
