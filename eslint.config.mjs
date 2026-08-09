import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"]
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/jsx-no-duplicate-props": "off",
      "import/no-anonymous-default-export": "off",
      "@next/next/no-img-element": "off"
    }
  }
];

export default eslintConfig;
