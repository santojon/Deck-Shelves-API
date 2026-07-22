# Changelog

All notable technical changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Canonical filter-tree types `PublicFilterGroup` / `PublicFilterItem` (a group
  combines items with `and` / `or`; each item names a filter type, may be
  `inverted`, and carries `params`) and `ParsedImport` (the normalized result of
  parsing an import file into shelves / smart shelves). These are now exported so
  consumers share one definition instead of re-declaring their own.
- `PublicSavedFilter.group` and the full `PublicSavedSmartFilter` projection
  (`mode`, `smartParams`, `filterGroup`, `sort`, `sortReverse`, `limit`,
  `visibleHours`, `visibleDaysOfWeek`) — the saved-filter getters already return
  these fields; the types now describe them. `PublicSmartShelf.sort` added for
  the same reason. All additive (optional fields).

### Changed

- **Contract now matches what the host actually emits / calls** (corrects types
  that never reflected the runtime — code that relied on the old shapes was
  already broken at run time):
  - `PublicShelfSource` collection variant is `{ type: "collection"; collectionId: string }`
    (was `collection`), and the `filter` variant is typed
    `{ sort?: string; group?: PublicFilterGroup }` (was `unknown`).
  - `SmartShelfSourceDescriptor.resolve` is `(limit, params?) => number[] | Promise<number[]>`
    (was `(apps, limit, params) => number[]`); `defaultParams` /  the `params`
    argument are `Record<string, number>`.

## [4.0.3] - 2026-07-20

### Added

- Built-in catalogue discovery: `listTriggerCatalog()`, `listShelfTemplates()`
  and `listShortcuts()`, with the new `PublicTriggerKind`, `PublicShelfTemplate`
  and `PublicShortcut` types. Read-only — integrations can build on the same
  trigger kinds, templates and gamepad shortcuts Deck Shelves ships.
- `EnvironmentInfo.os` — `getEnvironment()` now reports a best-effort host OS
  (`"SteamOS"` | `"Windows"` | `"macOS"` | `"Linux"`; `undefined` when it can't
  be determined), so integrations can branch per platform. Additive (optional field).
- `PublicTriggerKind.category` now documents `"peripherals"` (the controller /
  headphones / Bluetooth-device trigger kinds) alongside `time` / `session` /
  `power` / `connectivity` / `display` / `perf`.

## [4.0.2] - 2026-07-05

### Added

- **Export / import handler descriptors** (additive; v4 consumers stay binary-compatible). New `ExportHandlerDescriptor` / `ImportHandlerDescriptor` types + `registerExportHandler` / `registerImportHandler` (+ `getRegisteredExportHandlers` / `getRegisteredImportHandlers`) on `DeckShelvesPublicAPI` ([`src/types.ts`](src/types.ts)). A plugin offers "Export to format X" / "Import from format Y" by translating between the host's snapshot JSON — a serialized bundle of shelves, smart shelves, saved filters and saved smart filters — and its own format. Both sides exchange the snapshot as a JSON string, so no host types leak and the round-trip stays lossless: `export(snapshotJson)` returns your format's text; `import(raw)` returns a snapshot JSON string the host applies. Feature-detect (`typeof api.registerExportHandler === "function"`) until tagged.

## [4.0.1] - 2026-06-22

### Added

- **`form-data` pinned to `^4.0.6`** via a pnpm `overrides` entry ([`package.json`](package.json)) — resolves [GHSA-hmw2-7cc7-3qxx / CVE-2026-12143](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) (high: CRLF injection via unescaped multipart field names / filenames), a transitive **dev-dependency** pulled in by the test toolchain (jsdom). `pnpm audit` is clean. No runtime or consumer impact — `form-data` is never bundled into the published package.
- **`pnpm run update` / `update:check`** ([`package.json`](package.json)) — refresh every dev-dependency to latest (`pnpm update --latest && pnpm install`) or preview outdated ones (`pnpm outdated`), so the package can be kept current standalone (it ships from its own `Deck-Shelves-API` repo).
- **Expanded test coverage** ([`src/index.test.ts`](src/index.test.ts), 6 → 14 cases) — added `onReady` (microtask path, event path, single-fire, unsubscribe, error-swallow) and `onTeardown` (multi-fire, unsubscribe, error-swallow) suites.

## [4.0.0] - 2026-06-22

### Added

- **Profiles + integrations getters on `DeckShelvesPublicAPI`** (additive). New methods: `getProfiles()`, `getActiveProfile()`, `subscribeProfiles(cb)`, `getIntegrations()`, `subscribeIntegrations(cb)`. New public types `PublicProfile` (`id`, `name`, `createdAt`, `active`) and `IntegrationInfo` (`id`, `displayName`, `installed`, `enabled`) projected over the host's `profiles` / `integrationsEnabled` settings fields. Known integrations the host detects: `tabmaster`, `unifideck`, `nonsteambadges`.
- **Statistics + recommendation provider descriptors** (additive). New `StatisticsProviderDescriptor` / `RecommendationProviderDescriptor` + `StatisticsEntry` / `RecommendationEntry` types. Companion `register*Provider` + `getRegistered*Providers` methods mirror the existing widget / context / shelf-renderer pattern. Statistics providers expose key/value entries with optional grouping; recommendation providers rank appids with an optional reason string.
- **Settings snapshot + environment probe** (additive). `getSettingsSnapshot()` returns a `PublicSettingsSnapshot` (top-level toggles + `integrationsEnabled` + `featureToggles` + `activeProfileName`); `subscribeSettingsSnapshot(cb)` subscribes to diffs. `getEnvironment()` returns `{ pluginVersion, apiVersion, locale, isGamepadUi }`.
- **Lifecycle helpers exported from the npm package** ([`api/src/index.ts`](src/index.ts)). `onReady(cb: (api) => void): Unsubscribe` fires once when DS is ready (or on next microtask if already loaded). `onTeardown(cb: () => void): Unsubscribe` fires whenever the host unloads. Both wrap the existing `deck-shelves:ready` / `deck-shelves:teardown` window events with `addEventListener` cleanup so consumers don't have to wire them manually.
- **API v4 — 4 new descriptor types** (additive, v3 consumers stay binary-compatible). `DeckShelvesPublicAPI.version` bumped `3 → 4`. v4 was never split into a separate v4 / v5 release: every additive surface that had been queued (search + side-menu providers AND context / widget / shelf-renderer / metadata providers) rolls up into this single bump.
 - **`ContextProviderDescriptor`** + `registerContextProvider` / `getRegisteredContextProviders`. Companion plugins expose context signals (Bluetooth headset connected, specific game running, custom session predicates) via `snapshot()` + `subscribe(cb)`. Host consumes for shelf visibility rules and profile auto-switch.
 - **`WidgetProviderDescriptor`** + `registerWidgetProvider` / `getRegisteredWidgetProviders`. Runtime widgets that render non-game content. `render({ width, height })`; optional `refreshPolicy: number | "focus" | null`; optional `skeleton()` for first-paint.
 - **`ShelfRendererDescriptor`** + `registerShelfRenderer` / `getRegisteredShelfRenderers`. External render modes for the per-shelf `renderMode` dropdown. `layout({ items, focusedAppid, cardWidth, cardHeight, featured })`; optional `cardMode` + `virtualiseAfter`.
 - **`MetadataProviderDescriptor`** + `registerMetadataProvider` / `getRegisteredMetadataProviders`. Augments app metadata (ratings, playtime estimates, completion %, achievement counts, emulator tags). `fields: ReadonlyArray<string>` advertises what the provider populates; `resolve(appids, signal)` batches lookups with host-cancellation support.
- **Built-in Quick Search now lives in the same `searchProviders` registry external plugins write to.** No surface change for consumers of `@deck-shelves/api` — the descriptor (`id: "deck-shelves.shelves"`, `priority: 100`) is registered through the host's internal-bootstrap path. Effect on external plugins: `api.getRegisteredSearchProviders()` returns the built-in alongside any provider your plugin registered, sorted by priority desc. Collision detection works for the built-in id the same way as for any other registration.
- **`pnpm run upgrade` script** (`api/package.json`) + **self-contained helper** at [`scripts/upgrade-pnpm.cjs`](scripts/upgrade-pnpm.cjs). Mirrors the helper at the plugin repo root so the API package stays usable by downstream contributors who clone only the `Deck-Shelves-API` repo (which is the published surface — separate from the plugin). 4-step fallback chain: `pnpm self-update` (covers Homebrew / asdf / npm installs in-place), Corepack from PATH or `node`'s bundled location, `brew upgrade pnpm`, then `npm install -g pnpm@latest --force`. The parent repo's `pnpm run upgrade:api` now delegates to this self-contained script (was previously a thin wrapper that loaded `../scripts/build/upgrade-pnpm.cjs` from the plugin tree).
- **README rewrite (`api/README.md`).** Now mirrors the main Deck Shelves README layout: centered logo-block, comprehensive badge bar (npm version + total / monthly downloads, types, bundle size via bundlephobia, CI + release workflows, license, Node compat, platform, plugin host, sponsor + Ko-fi), and an 11-row Capability matrix mapping every surface (regular + smart shelf sources, filter types, sort options, importers/exporters, saved filters, search providers, side-menu providers, focus tracking, asset URLs, env probes) to its `register*` / snapshot / subscribe method names. Existing how-it-works + direct-API + version-policy + development sections preserved.
- **Surface v4 — Search providers** (part of the same v3 → v4 bump above). New `registerSearchProvider(d: SearchProviderDescriptor)` registration method on `DeckShelvesPublicAPI`, plus `getRegisteredSearchProviders()` accessor. Descriptor shape: `{ id, displayName, priority?, search(query, limit): Promise<SearchHit[]> }`. `SearchHit`: `{ id, appid?, title?, subtitle?, score?, onActivate?() }`. Providers ranked by `priority` desc; ties broken by `score` desc. Hits with both `appid` and `onActivate` prefer `onActivate` so custom routing wins.
- **Surface v4 — Side-menu providers** (part of the same v3 → v4 bump above). New `registerSideMenuProvider(d: SideMenuProviderDescriptor)` + `getRegisteredSideMenuProviders()`. Descriptor: `{ id, displayName, resolve(context: SideMenuContext): SideMenuEntry[] | Promise<SideMenuEntry[]> }`. `SideMenuContext`: `{ shelfId, focusedAppid }`. `SideMenuEntry`: `{ id, label, category?, icon?, disabled?, onActivate() }`. Entries are grouped under the providing plugin's section in the host's dpad-left side panel.
- **`@deck-shelves/api`: new descriptor types exported.** `SearchProviderDescriptor`, `SearchHit`, `SideMenuProviderDescriptor`, `SideMenuContext`, `SideMenuEntry`. Existing v3 consumers see no behaviour change; the new methods are only callable after upgrading the type package.

### Notes

- Both surfaces are additive — existing v3 consumers stay binary-compatible. Check `api.version >= 4` before calling the new methods.
- Stable `id` prefixes recommended (`my-plugin.foo`) so two plugins can't collide on the same descriptor.

## [0.1.1] - 2026-06-10

### Added

- pnpm-based tooling: ESLint (bug-catcher rules), Vitest, and a `tsup` dual
 ESM + CJS + `.d.ts` build.
- GitHub Actions: `ci.yml` (typecheck/lint/test/build/pack), `release.yml`
 (npm publish with provenance + GitHub Release), `bump.yml` (PR-title-driven version bump), and `pr-title.yml`.
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
