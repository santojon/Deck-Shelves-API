# Changelog

All notable technical changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-06-10

### Added

- pnpm-based tooling: ESLint (bug-catcher rules), Vitest, and a `tsup` dual
  ESM + CJS + `.d.ts` build.
- GitHub Actions: `ci.yml` (typecheck/lint/test/build/pack), `release.yml`
  (npm publish with provenance + GitHub Release), `bump.yml` (PR-title-driven
  version bump), and `pr-title.yml`.
- Project docs: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`,
  PR template, and issue templates.

### Fixed

- Build now emits a real ESM (`dist/index.js`) **and** CJS (`dist/index.cjs`)
  bundle plus bundled type declarations, matching the `exports` map. The
  previous two-`tsc`-pass setup overwrote the ESM output with CJS and never
  produced the `.mjs` file referenced in `package.json`.

## [0.1.0]

### Added

- Initial public API: `register()`, `getApi()`, `isReady()`, and the
  `DeckShelvesPublicAPI` type contract.
