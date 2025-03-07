import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { ConfigService } from "@nestjs/config";
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from "@nestjs/common";
import { IAllConfig } from "@/config/config.type";
import validationOptions from "@/utils/validation-options";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<IAllConfig>);
  app.use(helmet());
  app.enableShutdownHooks();
  app.setGlobalPrefix(configService.getOrThrow("app.apiPrefix", { infer: true }), {
    exclude: ["/"],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.getOrThrow("app.version", { infer: true }),
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(configService.getOrThrow("app.port", { infer: true }));
}
bootstrap();
