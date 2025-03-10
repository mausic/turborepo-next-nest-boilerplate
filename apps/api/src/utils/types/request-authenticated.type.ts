import { IJwtDecodedToken } from "./jwt-decoded-token";

export type IRequestAuthenticated = Request & { user: IJwtDecodedToken };
