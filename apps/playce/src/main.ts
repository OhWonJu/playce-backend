import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

import { DatabaseService } from "@lib/database/database.service";

import { PlayceModule } from "./playce.module";

async function bootstrap() {
  const app = await NestFactory.create(PlayceModule);

  app.enableCors({
    origin: "http://localhost:5173", // React 클라이언트 주소
    credentials: true,
  });

  const prismaService = app.get(DatabaseService);
  await prismaService.enableShutdownHooks(app);

  app.use(cookieParser());

  await app.listen(4000);
}
bootstrap();
