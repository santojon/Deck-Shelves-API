/**
 * Deck Shelves API public types. Mirrors the contract exposed by the
 * plugin at runtime on `window.deckShelves`.
 *
 * Keep this file dependency-free so the published package stays small
 * and works with any consumer bundler (esbuild, vite, webpack, etc.).
 */

export type Unsubscribe = () => void;

/** Compact snapshot of an app (what shelves render). */
export interface PublicAppMeta {
  appid: number;
  name: string;
  heroUrl?: string;
  portraitUrl?: string;
  logoUrl?: string;
  iconUrl?: string;
  installed?: boolean;
  isSteam?: boolean;
  deckCompatCategory?: number;
  playtimeMinutes?: number;
  addedTimestamp?: number;
  updatePending?: boolean;
  description?: string;
  fullDescription?: string;
  releaseTimestamp?: number;
  metacriticScore?: number;
  diskUsageBytes?: number;
}

/** Plain-data shelf snapshot exposed to consumers. */
export interface PublicShelf {
  id: string;
  title: string;
  enabled: boolean;
  hidden: boolean;
  source: PublicShelfSource;
  limit?: number;
  sort?: string | string[];
}

export type PublicShelfSource =
  | { type: "filter"; filter?: unknown }
  | { type: "tab"; tab: string }
  | { type: "collection"; collection: string }
  | { type: "wishlist" }
  | { type: "store" }
  | { type: "smart"; mode: string; smartParams?: Record<string, unknown> }
  | { type: "composite"; combine: "union" | "intersection"; sources: PublicShelfSource[] }
  | { type: "external"; sourceId: string };

export interface PublicSmartShelf {
  id: string;
  title: string;
  mode: string;
  enabled: boolean;
  hidden: boolean;
  limit?: number;
  smartParams?: Record<string, unknown>;
}

export interface PublicSavedFilter {
  id: string;
  name: string;
  description?: string;
}

export interface PublicSavedSmartFilter {
  id: string;
  name: string;
  description?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Registry descriptors
// ──────────────────────────────────────────────────────────────────────────

export interface ExternalShelfSourceDescriptor {
  id: string;
  label: string;
  resolve(limit: number): Promise<number[]> | number[];
}

export interface SmartShelfSourceDescriptor {
  id: string;
  label: string;
  resolve(apps: ReadonlyArray<PublicAppMeta>, limit: number, params?: Record<string, unknown>): number[];
  defaultParams?: Record<string, unknown>;
}

export interface ExternalFilterTypeDescriptor {
  id: string;
  label: string;
  evaluate(app: PublicAppMeta, params?: Record<string, unknown>): boolean;
}

export interface ExternalSortOptionDescriptor {
  id: string;
  label: string;
  sort(ids: number[], apps: ReadonlyArray<PublicAppMeta>): number[];
}

export type ImportTarget = "shelves" | "smart_shelves";

export interface ExternalImportTypeDescriptor {
  id: string;
  label: string;
  target?: ImportTarget;
  importer(): Promise<unknown> | unknown;
}

export interface ExternalSavedFilterDescriptor {
  id: string;
  name: string;
  description?: string;
  filterGroup: unknown;
}

// ──────────────────────────────────────────────────────────────────────────
// Focus + asset surface (new in v3)
// ──────────────────────────────────────────────────────────────────────────

export interface FocusedCardInfo {
  appid: number;
  shelfId: string | null;
}

export type AssetType = "hero" | "heroBlur" | "portrait" | "landscape" | "logo" | "icon" | "storeBackground";

// ──────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────

export interface DeckShelvesPublicAPI {
  /** API surface version. Bump on every breaking change. v3 is the first
   *  release of the import + register pattern. */
  readonly version: 3;

  // --- Registries -------------------------------------------------------
  registerShelfSource(d: ExternalShelfSourceDescriptor): Unsubscribe;
  registerSmartShelfSource(d: SmartShelfSourceDescriptor): Unsubscribe;
  registerFilterType(d: ExternalFilterTypeDescriptor): Unsubscribe;
  registerSortOption(d: ExternalSortOptionDescriptor): Unsubscribe;
  registerImportType(d: ExternalImportTypeDescriptor): Unsubscribe;
  registerSavedFilter(d: ExternalSavedFilterDescriptor): Unsubscribe;

  getRegisteredSources(): ReadonlyArray<ExternalShelfSourceDescriptor>;
  getRegisteredSmartSources(): ReadonlyArray<SmartShelfSourceDescriptor>;
  getRegisteredFilterTypes(): ReadonlyArray<ExternalFilterTypeDescriptor>;
  getRegisteredSortOptions(): ReadonlyArray<ExternalSortOptionDescriptor>;
  getRegisteredImportTypes(): ReadonlyArray<ExternalImportTypeDescriptor>;
  getRegisteredImportTypesForTarget(target: ImportTarget): ReadonlyArray<ExternalImportTypeDescriptor>;

  // --- Snapshots + subscriptions ----------------------------------------
  getShelves(): ReadonlyArray<PublicShelf>;
  getSmartShelves(): ReadonlyArray<PublicSmartShelf>;
  getSavedFilters(): ReadonlyArray<PublicSavedFilter>;
  getSavedSmartFilters(): ReadonlyArray<PublicSavedSmartFilter>;
  subscribeShelves(cb: (shelves: ReadonlyArray<PublicShelf>) => void): Unsubscribe;
  subscribeSmartShelves(cb: (shelves: ReadonlyArray<PublicSmartShelf>) => void): Unsubscribe;
  subscribeSavedFilters(cb: (filters: ReadonlyArray<PublicSavedFilter>) => void): Unsubscribe;

  // --- Focus tracking (new) ---------------------------------------------
  /** Returns the currently focused card or null when focus is elsewhere. */
  getFocusedCard(): FocusedCardInfo | null;
  /** Fires whenever the focused card changes (also fires with null when
   *  focus leaves all DS shelves). */
  subscribeFocusedCard(cb: (info: FocusedCardInfo | null) => void): Unsubscribe;

  // --- Asset URLs (new) -------------------------------------------------
  /** Returns the prioritized URL list for the given asset type and appid.
   *  Loopback (local Steam cache) first, then customimages, then CDN. */
  getAssetUrls(appid: number, type: AssetType): string[];

  // --- Environment probes -----------------------------------------------
  hasTabMaster(): boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// Integration contract (the register() argument)
// ──────────────────────────────────────────────────────────────────────────

export interface DeckShelvesIntegration {
  /** Human-readable identifier — appears in DS diagnostics + lets DS
   *  unregister the integration on hot-reload. */
  name: string;
  /** Integration version (semver string). Surfaced in diagnostics for
   *  debugging; not used by DS itself. */
  version?: string;
  /** Called once when DS is ready and the integration is registered.
   *  Receives the live `DeckShelvesPublicAPI` — register sources,
   *  subscribe to focus changes, etc. */
  onMount(api: DeckShelvesPublicAPI): void | Promise<void>;
  /** Called when DS is unloading or the integration is unregistered.
   *  Release any cached API references here. Returning a promise blocks
   *  the next install until cleanup finishes. */
  onUnmount?(): void | Promise<void>;
}

/** Shape of the runtime global `window.deckShelves` installed by the
 *  plugin. The API's `register()` helper internally calls
 *  `window.deckShelves.register(integration)` when present and falls back
 *  to a pending queue otherwise. */
export interface DeckShelvesGlobal {
  readonly version: number;
  readonly api: DeckShelvesPublicAPI;
  register(integration: DeckShelvesIntegration): Unsubscribe;
}
