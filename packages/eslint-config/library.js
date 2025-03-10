import globals from "globals";
import { config as baseConfig } from "./base.js";
import onlyWarn from "eslint-plugin-only-warn";
import { resolve } from "node:path";

const project = resolve(process.cwd(), "tsconfig.json");
/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const libraryConfig = [
  ...baseConfig,
  { ignores: ["**/.*.js", "**/node_modules/", "**/dist/"] },
  { files: ["**/*.js?(x)", "**/*.ts?(x)"] },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        React: true,
        JSX: true,
      },
    },
    plugins: {
      "only-warn": onlyWarn,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
      },
    },
  },
];
