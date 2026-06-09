import { defineConfig } from "tsup";

// Dual ESM + CJS build with bundled type declarations.
//   - ESM  → dist/index.js   (matches package.json "module" / exports.import)
//   - CJS  → dist/index.cjs  (matches package.json "main"   / exports.require)
//   - DTS  → dist/index.d.ts
// `src/types.ts` is type-only and gets inlined into the bundle + the .d.ts,
// so consumers get the full public surface from a single entry point.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
