import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly Logger = new Logger(AuthGuard.name);
  constructor(private readonly authService: AuthService) {}
  /**
   * Extracts the token from the cookie session
   * @param request request object
   * @returns returns the token from the cookie or null
   */
  private extractTokenFromCookie(request: Request): string | null {
    this.Logger.debug("Extracting token from cookie");
    const sessionCookie = request.cookies?.["__session"];
    this.Logger.debug(`Session cookie: ${sessionCookie}`);
    if (!sessionCookie) {
      this.Logger.debug("No session cookie found");
      return null;
    }
    return sessionCookie;
  }
  /**
   * Extracts the token from the header authorization
   * @param request request object
   * @returns returns the token from the header or null
   */
  private extractTokenFromHeader(request: Request): string | null {
    this.Logger.debug("Extracting token from header");
    if (!request.headers.authorization) {
      this.Logger.debug("No authorization header found");
      return null;
    }
    const [type, token] = request.headers.authorization?.split(" ") || [];
    this.Logger.debug(`Authorization type: ${type}`);
    this.Logger.debug(`Authorization token: ${token}`);
    return type === "Bearer" ? token : null;
  }
  /**
   * Extracts the token from the request object (cookie or header)
   * @param request request object
   * @returns returns the token from the request
   */
  private extractToken(request: Request): string | null {
    this.Logger.debug("Extracting token from request");
    const tokenSession = this.extractTokenFromCookie(request);
    const tokenHeader = this.extractTokenFromHeader(request);
    return tokenSession || tokenHeader;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.authService.validateToken(token);
      request["user"] = payload;
    } catch (error) {
      this.Logger.error("Error validating token: ", error);
      throw new UnauthorizedException();
    }
    return true;
  }
}
