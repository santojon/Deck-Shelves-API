# @deck-shelves/api

TypeScript API for integrating with [Deck Shelves](https://github.com/santojon/Deck-Shelves).
## Install

```bash
npm install @deck-shelves/api
# or
pnpm add @deck-shelves/api
```

## Quick start

```ts
import { register } from "@deck-shelves/api";

const off = register({
  name: "my-plugin",
  version: "1.0.0",
  onMount(api) {
    // Register a custom source that other shelves can reference
    api.registerShelfSource({
      id: "my-plugin/recently-rated",
      label: "Recently rated",
      async resolve(limit) {
        const data = await fetch("/api/my-plugin/ratings").then((r) => r.json());
        return data.appids.slice(0, limit);
      },
    });

    // React to focus changes on DS shelves
    api.subscribeFocusedCard((info) => {
      if (!info) return;
      console.log("focused", info.appid, "on shelf", info.shelfId);
    });

    // Build asset URLs without re-implementing Steam's fallback chain
    const heroes = api.getAssetUrls(620, "hero");
    // → ['https://steamloopback.host/assets/620/library_hero.jpg?c=...', ...]
  },
  onUnmount() {
    // Cleanup any cached API references — the api object passed to
    // onMount becomes stale after this.
  },
});

// Call `off()` when your plugin unloads.
```

## How it works

The package is dependency-free and handles three timing cases automatically:

1. Deck Shelves already loaded → calls `register` synchronously.
2. Deck Shelves loads later → queues your integration and registers it on the `deck-shelves:ready` event.
3. Your module loads after the ready event fired → still registers from the pending queue when DS drains.

The returned `Unsubscribe` works regardless of which case applied.

## API surface

See [`src/types.ts`](src/types.ts) for the full `DeckShelvesPublicAPI` interface. Highlights:

- **Registries**: `registerShelfSource`, `registerSmartShelfSource`, `registerFilterType`, `registerSortOption`, `registerImportType`, `registerSavedFilter`.
- **Snapshots + subscriptions**: `getShelves`, `subscribeShelves`, and the equivalents for smart shelves + saved filters.
- **Focus tracking**: `getFocusedCard`, `subscribeFocusedCard`.
- **Asset URLs**: `getAssetUrls(appid, type)` — same prioritized loopback → CDN chain Deck Shelves uses internally. Types: `hero`, `heroBlur`, `portrait`, `landscape`, `logo`, `icon`, `storeBackground`.
- **Environment probes**: `hasTabMaster`.

## Direct API access (advanced)

Most consumers don't need this, but for short-lived scripts (CDP probes, dev tools, one-shot scripts that don't want lifecycle management):

```ts
import { getApi, isReady } from "@deck-shelves/api";

if (isReady()) {
  const api = getApi();
  api?.getShelves();
}
```

## Version policy

The `version` field on `DeckShelvesPublicAPI` bumps on every breaking change. Consumers should check `api.version` if they need to gate on a specific surface revision.

## Development

```bash
corepack enable
pnpm install
pnpm run check   # typecheck + lint + test
pnpm run build   # ESM + CJS + .d.ts into dist/
```

Releases are automated from `main`: a tag-prefixed PR (`[FIX]`, `[FEATURE]`,
`[REFACTOR]`, …) drives the version bump on merge, and the resulting `vX.Y.Z`
tag publishes to npm with provenance. See [CONTRIBUTING.md](CONTRIBUTING.md)
for the full workflow and [SECURITY.md](SECURITY.md) for reporting issues.

## License

MIT
