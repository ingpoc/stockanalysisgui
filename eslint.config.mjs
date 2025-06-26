import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tailwindPlugin from 'eslint-plugin-tailwindcss';

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

function deepClean(obj, visited = new WeakSet()) {
  if (obj === null || typeof obj !== "object") return obj;
  
  if (visited.has(obj)) return obj; // Prevent circular reference
  visited.add(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClean(item, visited));
  }
  
  const newObj = {};
  for (const key in obj) {
    if (deprecatedKeys.includes(key)) continue;
    newObj[key] = deepClean(obj[key], visited);
  }
  return newObj;
}

const cleanedLegacyConfig = Array.isArray(legacyConfig)
  ? legacyConfig.map(deepClean)
  : [deepClean(legacyConfig)];

export default [
  {
    // Global ignores and overrides
    ignores: [".next/", "node_modules/"], // Add common ignores
    overrideConfig: {
      linterOptions: {
        reportUnusedDisableDirectives: "error",
      },
    },
  },
  ...cleanedLegacyConfig,
  // Prettier integration - must be last
  eslintPluginPrettierRecommended,
  // Tailwind CSS plugin configuration
  {
    plugins: {
      tailwindcss: tailwindPlugin
    },
    rules: {
      // Enforce class sorting
      'tailwindcss/classnames-order': 'warn',
      // Optional: Add other Tailwind CSS rules if desired
      // 'tailwindcss/no-custom-classname': 'warn',
      // 'tailwindcss/no-contradicting-classname': 'error',
    },
    // Apply Tailwind rules only to relevant files
    files: ['**/*.{ts,tsx,js,jsx}'],
  }
];
