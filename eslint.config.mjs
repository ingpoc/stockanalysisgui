import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const legacyConfig = compat.config({
  extends: ["next/core-web-vitals", "next/typescript"],
});

const deprecatedKeys = [
  "useEslintrc",
  "extensions",
  "resolvePluginsRelativeTo",
  "rulePaths",
  "ignorePath",
  "reportUnusedDisableDirectives"
];

function deepClean(obj) {
  if (Array.isArray(obj)) {
    return obj.map(deepClean);
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (deprecatedKeys.includes(key)) continue;
      newObj[key] = deepClean(obj[key]);
    }
    return newObj;
  }
  return obj;
}

const cleanedLegacyConfig = Array.isArray(legacyConfig)
  ? legacyConfig.map(deepClean)
  : [deepClean(legacyConfig)];

export default [
  {
    overrideConfig: {
      linterOptions: {
        reportUnusedDisableDirectives: "error",
      },
    },
  },
  ...cleanedLegacyConfig,
];
