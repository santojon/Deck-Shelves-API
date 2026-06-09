import tsParser from "@typescript-eslint/parser";

// Mirrors the Deck Shelves lint philosophy: high bug-catching value, low
// false-positive friction. Stylistic-only rules (formatting, line length,
// naming) are intentionally NOT added — they generate churn without
// catching bugs. Tests are excluded from the lint surface.
export default [
  {
    files: ["src/**/*.ts"],
    ignores: ["src/**/*.test.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // Above complexity 10 a function is usually doing too much.
      complexity: ["error", 10],
      // Code-file size cap (code lines only; blanks + comments ignored).
      "max-lines": ["error", { max: 1000, skipBlankLines: true, skipComments: true }],
      // Modern JS: forbid `var`, require `const` for never-reassigned `let`.
      "no-var": "error",
      "prefer-const": "error",
      // Bug catchers: strict equality (`'smart'` keeps `== null` shorthand),
      // no `debugger`, throw real Errors, no duplicate imports, no
      // self-assignment, no unreachable code, no silent switch fallthrough.
      eqeqeq: ["error", "smart"],
      "no-debugger": "error",
      "no-throw-literal": "error",
      "no-duplicate-imports": "error",
      "no-self-assign": "error",
      "no-unreachable": "error",
      "no-fallthrough": "error",
    },
  },
];
