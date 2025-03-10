export type IJwtDecodedToken = {
  azp: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  nbf: number;
  sub: string;
  metadata: unknown;
};
