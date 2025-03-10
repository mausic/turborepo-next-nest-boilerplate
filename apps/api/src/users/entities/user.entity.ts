import { ApiProperty } from "@nestjs/swagger";
import { User } from "@repo/db/generated/client";
import { Exclude } from "class-transformer";

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
  @Exclude()
  id: number;
  @ApiProperty({ example: "mailbox@mail.com" })
  email: string;
  @ApiProperty({ example: "John" })
  firstName: string;
  @ApiProperty({ example: "Doe" })
  lastName: string;
  @ApiProperty({ example: "+123456789" })
  phoneNumber: string;
  @ApiProperty({ example: "Acme Inc." })
  organization: string;
  @ApiProperty({ example: "123456" })
  clerkId: string;
  @ApiProperty({ example: "2021-08-01T00:00:00.000Z" })
  createdAt: Date;
  @ApiProperty({ example: "2021-08-01T00:00:00.000Z" })
  updatedAt: Date;
}
