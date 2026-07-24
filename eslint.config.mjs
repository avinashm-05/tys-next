import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy vendor bundle copied verbatim for the public site (Bootstrap,
    // jQuery, select2, AOS). Not our code — never lint it.
    "public/**",
  ]),
  {
    // The public site is a faithful port of the old PHP marketing page: it
    // reuses the old markup + CSS on purpose, so <img> (not next/image) and
    // plain anchors to future routes are intentional, not lint smells.
    files: ["src/app/(public)/**/*.tsx", "src/components/public/**/*.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      // Raw <link> to the static legacy stylesheets is deliberate — importing
      // them would let Turbopack rewrite the old relative font/image url()s.
      "@next/next/no-css-tags": "off",
    },
  },
]);

export default eslintConfig;
