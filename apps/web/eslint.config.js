import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
const config = [
  ...nextJsConfig,
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
];
export default config;
