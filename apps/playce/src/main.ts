import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import compression from "compression";

import { DatabaseService } from "@lib/database/database.service";

import { PlayceModule } from "./playce.module";

async function bootstrap() {
  const app = await NestFactory.create(PlayceModule);

  app.enableCors({
    origin: process.env.CLIENT_URL, // React 클라이언트 주소
    credentials: true,
  });

  const prismaService = app.get(DatabaseService);
  await prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.use(compression());

  await app.listen(4000);
}
bootstrap();
