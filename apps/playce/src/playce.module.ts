import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PlayceController } from "./playce.controller";
import { PlayceService } from "./playce.service";
import { AlbumsModule } from "./api/albums/albums.module";
import { ArtistsModule } from "./api/artists/artists.module";
import { TracksModule } from "./api/tracks/tracks.module";
import { AuthModule } from "./api/auth/auth.module";
import { UsersModule } from "./api/users/users.module";
import { PaymentsModule } from "./api/payments/payments.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AlbumsModule,
    ArtistsModule,
    AuthModule,
    TracksModule,
    UsersModule,
    PaymentsModule,
  ],
  controllers: [PlayceController],
  providers: [PlayceService],
})
export class PlayceModule {}
