import { NestFactory } from "@nestjs/core";
import { PlayceModule } from "./playce.module";
import { DatabaseService } from "@lib/database/database.service";

async function bootstrap() {
  const app = await NestFactory.create(PlayceModule);

  const prismaService = app.get(DatabaseService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(4000);
}
bootstrap();
