import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { createKeyv, Keyv } from "@keyv/redis";
import { CacheableMemory } from "cacheable";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import appConfig from "@/config/app.config";
import authConfig from "@/auth/config/auth.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [appConfig, authConfig],
    }),
    CacheModule.register({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: "1h", lruSize: 5000 }),
            }),
            createKeyv(`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`, {
              namespace: "api",
              keyPrefixSeparator: ":",
            }),
          ],
        };
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
