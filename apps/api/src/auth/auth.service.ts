import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { IAllConfig } from "@/config/config.type";

type IJwtDecodedToken = {
  azp: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  nbf: number;
  sub: string;
  metadata: unknown;
};

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private readonly permittedOrigins = ["http://localhost:3000"];

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService<IAllConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async validateToken(token: string): Promise<boolean> {
    this.logger.debug("Validating token");
    let decodedToken: IJwtDecodedToken;
    // check whether the token is stored in the cache
    const cacheTokenId = `auth:token:${token}`;
    const cachedToken = await this.cacheManager.get<IJwtDecodedToken>(cacheTokenId);
    if (cachedToken) {
      this.logger.debug("Token is cached");
      decodedToken = cachedToken;
    } else {
      // decode the token
      decodedToken = await this.jwtService.verifyAsync<IJwtDecodedToken>(token, {
        publicKey: this.configService.getOrThrow("auth.jwksPublicKey", { infer: true }),
        algorithms: ["RS256"],
      });
    }
    // check if the token is valid
    if (!decodedToken) {
      throw new Error("Token is missing");
    }
    this.logger.debug(`decoded token: ${JSON.stringify(decodedToken, null, 2)}`);
    const currentTime = Math.floor(Date.now() / 1000);
    this.logger.debug("Expiration time:", new Date(decodedToken.exp * 1000).toISOString());
    if (decodedToken.exp < currentTime || decodedToken.nbf > currentTime) {
      throw new Error("Token is expired");
    }
    // check if the token is from a valid origin
    if (decodedToken.azp && !this.permittedOrigins.includes(decodedToken.azp)) {
      throw new Error("Token is from an invalid origin");
    }
    // check if issuer is valid
    if (
      decodedToken.iss &&
      decodedToken.iss !== this.configService.getOrThrow("auth.jwksIssuer", { infer: true })
    ) {
      throw new Error("Token issuer is invalid");
    }
    // store the token in the cache until its expiration time
    const cacheTtl = (decodedToken.exp - currentTime) * 1000;
    await this.cacheManager.set(cacheTokenId, decodedToken, cacheTtl);
    return true;
  }
}
