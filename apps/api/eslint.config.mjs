import { nestJsConfig } from '@repo/eslint-config/nest-js';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nestJsConfig,
  {
    ignores: ["prettier.config.js"],
  }
];