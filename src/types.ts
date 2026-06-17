/**
 * Deck Shelves API public types. Mirrors the contract exposed by the
 * plugin at runtime on `window.deckShelves`.
 *
 * Keep this file dependency-free so the published package stays small
 * and works with any consumer bundler (esbuild, vite, webpack, etc.).
 */

export type Unsubscribe = () => void;

// PublicAppMeta exposes BOTH naming styles. New consumers should use the
// camelCase fields (isSteam, playtimeMinutes…); the snake_case aliases
// mirror Steam's raw AppOverview shape so the runtime adapter can populate
// them without translation loss when calling internal evaluators that
// still read raw field names.
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
  lastPlayedTimestamp?: number;
  addedTimestamp?: number;
  updatePending?: boolean;
  description?: string;
  fullDescription?: string;
  releaseTimestamp?: number;
  metacriticScore?: number;
  diskUsageBytes?: number;
  supportsCloud?: boolean;
  controllerSupport?: number;
  is_non_steam?: boolean;
  playtime_forever?: number;
  last_played?: number;
  deck_compatibility_category?: number;
  bCloudAvailable?: boolean;
  nControllerSupport?: number;
  app_type?: number;
  is_installed?: boolean;
  is_hidden?: boolean;
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
  label?: string;
  displayName?: string;
  version?: number;
  resolve(limit: number): Promise<number[]> | number[];
}

export interface SmartShelfSourceDescriptor {
  id: string;
  label?: string;
  displayName?: string;
  version?: number;
  category?: string;
  paramMeta?: Readonly<Record<string, { label: string; min: number; max: number; step: number; unit?: string; }>>;
  resolve(apps: ReadonlyArray<PublicAppMeta>, limit: number, params?: Record<string, unknown>): number[];
  defaultParams?: Record<string, unknown>;
}

export interface ExternalFilterTypeDescriptor {
  id: string;
  label?: string;
  displayName?: string;
  version?: number;
  defaultParams?: Readonly<Record<string, unknown>>;
  invertible?: boolean;
  renderEditor?: (props: { params: Readonly<Record<string, unknown>>; onChange: (next: Record<string, unknown>) => void; }) => unknown;
  evaluate(app: PublicAppMeta, params?: Record<string, unknown>): boolean;
}

export interface ExternalSortOptionDescriptor {
  id: string;
  label?: string;
  displayName?: string;
  version?: number;
  sort(ids: number[] | ReadonlyArray<number>, apps: ReadonlyArray<PublicAppMeta>): number[];
}

export type ImportTarget = "shelves" | "smart_shelves";

export interface ExternalImportTypeDescriptor {
  id: string;
  label?: string;
  displayName?: string;
  version?: number;
  target?: ImportTarget;
  fileExtension?: string;
  icon?: unknown;
  importer?(): Promise<unknown> | unknown;
  parse?(raw: string): Promise<unknown>;
  runImport?(): void | Promise<void>;
}

export interface ExternalSavedFilterDescriptor {
  id: string;
  name: string;
  description?: string;
  version?: number;
  filterGroup?: unknown;
  group?: unknown;
}

// ──────────────────────────────────────────────────────────────────────────
// Search + side-menu providers (new in v4 — opt-in features)
// ──────────────────────────────────────────────────────────────────────────

export interface SearchProviderDescriptor {
  id: string;
  displayName: string;
  version?: number;
  priority?: number;
  search(query: string, limit: number): Promise<SearchHit[]> | SearchHit[];
}

export interface SearchHit {
  id: string;
  appid?: number;
  title?: string;
  subtitle?: string;
  score?: number;
  onActivate?: () => void;
}

export interface SideMenuProviderDescriptor {
  id: string;
  displayName: string;
  version?: number;
  resolve(context: SideMenuContext): Promise<SideMenuEntry[]> | SideMenuEntry[];
}

export interface SideMenuContext {
  shelfId: string | null;
  focusedAppid: number | null;
}

export interface SideMenuEntry {
  id: string;
  label: string;
  category?: string;
  /** ReactNode rendered before the label. Kept as `unknown` so this
   *  package stays React-free. The runtime accepts any ReactNode. */
  icon?: unknown;
  disabled?: boolean;
  onActivate(): void | Promise<void>;
}

// ──────────────────────────────────────────────────────────────────────────
// v4 — Context / Widget / ShelfRenderer / Metadata providers
// ──────────────────────────────────────────────────────────────────────────

export interface ContextProviderDescriptor {
  id: string;
  displayName: string;
  version?: string | number;
  snapshot(): unknown;
  subscribe(cb: (value: unknown) => void): () => void;
}

export interface WidgetProviderDescriptor {
  id: string;
  displayName: string;
  version?: string | number;
  /** Returns the widget content. Kept as `unknown` so this package
   *  stays React-free; the runtime accepts any ReactNode. */
  render(size: { width: number; height: number }): unknown;
  refreshPolicy?: number | "focus" | null;
  skeleton?(): unknown;
}

export interface ShelfRendererDescriptor {
  id: string;
  displayName: string;
  version?: string | number;
  layout(params: {
    items: ReadonlyArray<{ appid: number; name?: string }>;
    focusedAppid: number | null;
    cardWidth: number;
    cardHeight: number;
    featured: boolean;
  }): unknown;
  cardMode?: "normal" | "featured" | "compact";
  virtualiseAfter?: number;
}

export interface MetadataProviderDescriptor {
  id: string;
  displayName: string;
  version?: string | number;
  fields: ReadonlyArray<string>;
  resolve(appids: ReadonlyArray<number>, signal?: AbortSignal): Promise<Record<number, Record<string, unknown>>>;
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
  /** API surface version. Bump on every breaking change. v3 added the
   *  import + register pattern; v4 consolidates search + side-menu
   *  providers AND context / widget / shelf-renderer / metadata
   *  providers — every additive bump that hadn't shipped yet rolls up
   *  into a single v4 release. */
  readonly version: 4;

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

  // --- Search + side-menu providers (v4, additive) ----------------------
  registerSearchProvider(d: SearchProviderDescriptor): Unsubscribe;
  getRegisteredSearchProviders(): ReadonlyArray<SearchProviderDescriptor>;
  registerSideMenuProvider(d: SideMenuProviderDescriptor): Unsubscribe;
  getRegisteredSideMenuProviders(): ReadonlyArray<SideMenuProviderDescriptor>;

  // --- v4 surfaces (additive) -------------------------------------------
  registerContextProvider(d: ContextProviderDescriptor): Unsubscribe;
  getRegisteredContextProviders(): ReadonlyArray<ContextProviderDescriptor>;
  registerWidgetProvider(d: WidgetProviderDescriptor): Unsubscribe;
  getRegisteredWidgetProviders(): ReadonlyArray<WidgetProviderDescriptor>;
  registerShelfRenderer(d: ShelfRendererDescriptor): Unsubscribe;
  getRegisteredShelfRenderers(): ReadonlyArray<ShelfRendererDescriptor>;
  registerMetadataProvider(d: MetadataProviderDescriptor): Unsubscribe;
  getRegisteredMetadataProviders(): ReadonlyArray<MetadataProviderDescriptor>;
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
