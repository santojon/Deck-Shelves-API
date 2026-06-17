# Contributing to @deck-shelves/api

Thank you for your interest in contributing! This guide covers the development
setup, coding conventions, and how to submit changes.

This is the TypeScript integration API for
[Deck Shelves](https://github.com/santojon/Deck-Shelves). It is a small,
dependency-free package published to npm. Issues with the **plugin itself**
belong in the plugin repo, not here.

## Prerequisites

- **Node.js** 20 or later
- **pnpm** 10 or later (`corepack enable` will provision the pinned version; if `corepack` isn't on PATH, run `pnpm run upgrade:api` from the repo root — the helper script finds Corepack via Node's bundle and falls back to `npm install -g pnpm@latest`)

## Supported platforms

The dev / build / test flows are pure Node and run on **Linux, macOS, and
Windows**.

| Workflow                                       | Linux | macOS | Windows |
|------------------------------------------------|:-----:|:-----:|:-------:|
| `pnpm install`                                 |  ✅   |  ✅   |   ✅    |
| `pnpm run build`                               |  ✅   |  ✅   |   ✅    |
| `pnpm run typecheck`                           |  ✅   |  ✅   |   ✅    |
| `pnpm run test`                                |  ✅   |  ✅   |   ✅    |
| `pnpm run lint`                                |  ✅   |  ✅   |   ✅    |
| `pnpm run check` (typecheck + lint + test)     |  ✅   |  ✅   |   ✅    |

## Getting Started

1. Fork and clone the repository.
2. Install dependencies:

   ```bash
   corepack enable    # if "corepack: command not found", run `pnpm run upgrade:api` from the repo root instead
   pnpm install
   ```

3. Run the full local check:

   ```bash
   pnpm run check
   ```

## Project Structure

```
src/index.ts        Public entry: register(), getApi(), isReady()
src/index.test.ts   Vitest suite for the register/queue logic
src/types.ts        Public type contract (DeckShelvesPublicAPI, descriptors)
tsup.config.ts      Dual ESM + CJS + .d.ts build config
eslint.config.js    Bug-catcher lint rules (flat config)
vitest.config.ts    Test runner config
.github/workflows/  CI, release (npm publish), version bump, PR title check
```

## Code Style

- **Indentation**: 2 spaces
- **Semicolons**: always
- **Quotes**: double quotes for strings
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types
- **TypeScript**: avoid `any` — use proper types or `unknown`
- **Dependencies**: the published package must stay **dependency-free**
- **Comments**: only where the logic is not self-evident

Lint enforces bug-catchers (strict equality, no `var`, complexity ≤ 10, etc.),
not formatting. Run `pnpm run lint:fix` to auto-fix what's fixable.

## Scripts

| Script                  | What it does                                        |
|-------------------------|-----------------------------------------------------|
| `pnpm run build`        | Build ESM + CJS + type declarations into `dist/`    |
| `pnpm run typecheck`    | `tsc --noEmit`                                       |
| `pnpm run lint`         | ESLint over `src/`                                   |
| `pnpm run test`         | Vitest (run mode)                                    |
| `pnpm run check`        | typecheck + lint + test (the pre-PR gate)            |
| `pnpm run release:dry`  | clean → check → build → `pnpm pack --dry-run`        |
| `pnpm run release:local`| clean → check → build → `pnpm pack` (writes a tgz)   |

## Submitting Changes

1. Branch off `main`.
2. Make your change and add/update tests.
3. Run `pnpm run check` — it must pass.
4. Add entries under `## [Unreleased]` in **both** `CHANGELOG.md` (technical)
   and `RELEASE_NOTES.md` (user-facing).
5. Open a PR. **The PR title must start with a tag** — this drives the
   automatic version bump when the PR merges:

   | Tag             | Bump  | Use for                          |
   |-----------------|-------|----------------------------------|
   | `[FIX]`         | patch | Bug fix                          |
   | `[ENHANCEMENT]` | patch | Small improvement                |
   | `[PERF]`        | patch | Performance improvement          |
   | `[QA]`          | patch | Tests / tooling                  |
   | `[FEATURE]`     | minor | New feature                      |
   | `[CLEANUP]`     | minor | Code cleanup                     |
   | `[REFACTOR]`    | major | Refactor / **breaking change**   |

## Release Flow

Releases are automated — maintainers do not publish by hand:

1. A tagged PR merges to `main`.
2. `bump.yml` computes the new version from the PR title, updates
   `package.json` + `CHANGELOG.md` + `RELEASE_NOTES.md`, commits, and pushes a
   `vX.Y.Z` tag.
3. The `vX.Y.Z` tag triggers `release.yml`, which builds, publishes to npm via
   **Trusted Publishing (OIDC)** with automatic provenance, and cuts a GitHub
   Release using the notes for that version.

To preview the publishable artifact locally without releasing:

```bash
pnpm run release:dry
```
