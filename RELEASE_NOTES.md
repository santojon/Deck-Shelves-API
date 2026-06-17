# Release Notes

User-facing notes for each release. Entries here are extracted verbatim into
the GitHub Release body at tag time.

## [Unreleased]

- **API v4 — four new descriptor types you can register.** Context providers (snapshot + subscribe for external context signals), Widget providers (render non-game content in shelves), Shelf renderers (custom layout modes), Metadata providers (augment app metadata for filter / sort consumers). `version` bumps `3 → 4`; v3 consumers stay binary-compatible. See [api/CHANGELOG.md](CHANGELOG.md) for the descriptor shapes.
- **`pnpm run upgrade` works without Corepack on PATH.** A new helper script (`scripts/upgrade-pnpm.cjs`) ships with the API package — works whether pnpm came from Homebrew, asdf, npm, or a manual download. If your Node install doesn't expose Corepack, the script falls through to Homebrew or `npm install -g pnpm@latest --force`. No more `bash: corepack: command not found` or `EEXIST` errors on `/opt/homebrew/bin/pnpm`.
- **README refreshed.** New badges block matching the main Deck Shelves repo: npm version, downloads (total + monthly), TypeScript types badge, bundle size, CI + release workflows, license, Node compat, platform, sponsor. Added a capability matrix table that maps every API surface (regular + smart shelf sources, filter types, sort options, importers/exporters, saved filters, search providers, side-menu providers, focus tracking, asset URLs, env probes) to its `register*` / snapshot / subscribe methods so consumers can scan it as a quick reference instead of opening `src/types.ts`.
- **Surface v4 — Search providers.** Plugins can now contribute hits to the host's keyboard-driven search overlay via `registerSearchProvider({ id, displayName, search(query, limit) })`. Each hit can carry a custom `onActivate` so the host routes the user wherever the plugin wants (a shelf card, a library entry, a custom route).
- **Surface v4 — Side-menu providers.** Plugins can contribute entries to the host's dpad-left side panel via `registerSideMenuProvider({ id, displayName, resolve(context) })`. The host passes the active shelf id + currently focused appid so the plugin can return context-aware actions ("Suggest from this shelf", "Add to play-next", etc.).
- New TypeScript types exported: `SearchProviderDescriptor`, `SearchHit`, `SideMenuProviderDescriptor`, `SideMenuContext`, `SideMenuEntry`.
- v3 consumers stay binary-compatible — gate calls behind `api.version >= 4`.

## [0.1.1] - 2026-06-10

- Set up the package for npm publishing: dual ESM/CJS builds, automated CI,
  and a tag-driven release pipeline.

## [0.1.0]

- First release of `@deck-shelves/api` — register sources, filters, sorts,
  import types, and subscribe to Deck Shelves from your own plugin or theme.
