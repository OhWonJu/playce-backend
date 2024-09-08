export class GetSummaryDTO {
  myAlbums: {
    id: string;
    albumName: string;
    albumArtURL: string;
    artist: {
      artistName: string;
    };
  }[];
  myPlayList: {
    id: string;
    playListName: string;
  }[];
}
