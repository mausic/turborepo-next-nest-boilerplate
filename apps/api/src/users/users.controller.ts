import { ErrorEntity } from "@/shared/errors/error-entity";
import { ErrorServerEntity } from "@/shared/errors/error-server-entity";
import { ErrorUnauthorizedEntity } from "@/shared/errors/error-unauthorized-entity";
import { Controller, Get, Logger, Req } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { type IRequestAuthenticated } from "@/utils/types/request-authenticated.type";
import { UserEntity } from "./entities/user.entity";

@Controller("users")
@ApiBearerAuth()
@ApiCookieAuth("__session")
@ApiTags("users")
@ApiInternalServerErrorResponse({ description: "Internal server error", type: ErrorServerEntity })
@ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorUnauthorizedEntity })
@ApiForbiddenResponse({ description: "Forbidden", type: ErrorEntity })
export class UsersController {
  private logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({
    summary: "Get user profile",
    description: "Get the profile of the authenticated user",
  })
  @ApiOkResponse({ description: "User profile", type: UserEntity })
  async profile(@Req() request: IRequestAuthenticated) {
    const user = await this.usersService.profile(request.user.sub);
    return new UserEntity(user);
  }
}
