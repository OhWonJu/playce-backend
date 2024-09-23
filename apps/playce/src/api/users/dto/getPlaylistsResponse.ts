export interface GetPlaylistsResponse {
  playlists: {
    id: string;
    isPublic: boolean;
    playListName: string;
    thumbNail: string[];
    updatedAt: Date;
    count: number;
  }[];
  nextCursor?: string;
}
