import { registerAs } from "@nestjs/config";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { IAppConfig } from "./app-config.type";
import validateConfig from "@/utils/validate-config";

enum Environment {
  Development = "development",
  Production = "production",
  Staging = "staging",
}
class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  API_VERSION: number;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number;

  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;
}
export default registerAs<IAppConfig>("app", () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  let port: number;
  if (process.env.APP_PORT) {
    port = parseInt(process.env.APP_PORT);
  } else if (process.env.PORT) {
    port = parseInt(process.env.PORT);
  } else {
    port = 3000;
  }

  return {
    apiPrefix: process.env.API_PREFIX || "api",
    port: port,
    nodeEnv: process.env.NODE_ENV || Environment.Development,
    name: process.env.APP_NAME || "NestJS API",
    version: process.env.API_VERSION || "1",
    workingDirectory: process.env.PWD || process.cwd(),
  };
});
