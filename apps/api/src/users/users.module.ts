import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PrismaModule } from "@/providers/prisma.module";

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [PrismaModule],
})
export class UsersModule {}
