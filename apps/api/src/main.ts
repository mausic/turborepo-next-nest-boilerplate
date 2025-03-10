import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { ConfigService } from "@nestjs/config";
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from "@nestjs/common";
import { IAllConfig } from "@/config/config.type";
import validationOptions from "@/utils/validation-options";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFileSync } from "fs";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<IAllConfig>);
  app.use(helmet());
  app.use(cookieParser());
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

  // set up Swagger
  const options = new DocumentBuilder()
    .setTitle("Awesome API")
    .setDescription("Awesome API documentation for an awesome project")
    .setVersion("1.0")
    .setContact("Awesome Team", "mausic.me", "maksym@ryndia.me")
    .setExternalDoc("JSON", "/docs")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  writeFileSync("./swagger-spec.json", JSON.stringify(document));
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });

  await app.listen(configService.getOrThrow("app.port", { infer: true }));
}
bootstrap();
