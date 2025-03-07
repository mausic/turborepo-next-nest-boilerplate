import { IsString } from "class-validator";
import { IAuthConfig } from "./auth-config.types";
import validateConfig from "@/utils/validate-config";
import { registerAs } from "@nestjs/config";

class EnvironmentVariablesValidator {
  @IsString()
  JWKS_PUBLIC_KEY: string;

  @IsString()
  JWKS_ISSUER: string;
}

export default registerAs<IAuthConfig>("auth", () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    jwksPublicKey: process.env.JWKS_PUBLIC_KEY.replace(/\\n/g, "\n"),
    jwksIssuer: process.env.JWKS_ISSUER,
  };
});
