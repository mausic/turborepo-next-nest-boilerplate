import { IAuthConfig } from "@/auth/config/auth-config.types";
import { IAppConfig } from "./app-config.type";

export type IAllConfig = {
  app: IAppConfig;
  auth: IAuthConfig;
};
