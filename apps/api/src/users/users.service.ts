import { PrismaService } from "@/providers/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(private db: PrismaService) {}

  async profile(id: string) {
    return this.db.user.findFirst({
      where: { clerkId: id },
    });
  }
}
