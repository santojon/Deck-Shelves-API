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

/** A user-saved configuration profile. The internal snapshot payload is
 *  intentionally omitted from the public projection — consumers receive
 *  identity + metadata only. */
export interface PublicProfile {
  id: string;
  name: string;
  /** ISO-8601 timestamp of when the profile was saved. */
  createdAt: string;
  /** True when this is the profile currently applied to live settings. */
  active: boolean;
}

/** Top-level user settings projection. Booleans + the integrations /
 *  feature-flag maps. Snapshots intentionally omit shelf / smart-shelf
 *  / saved-filter lists — those have their own getters (`getShelves()`,
 *  `getSmartShelves()`, `getSavedFilters()`). */
export interface PublicSettingsSnapshot {
  enabled: boolean;
  hideRecents: boolean;
  recentsReplaceSource: boolean;
  hideHomeTabs: boolean;
  shelfHeroBackground: boolean;
  globalHeroEnabled: boolean;
  globalFullPageShelf: boolean;
  smartShelvesEnabled: boolean;
  unifiedListEnabled: boolean;
  forceCssLoaderThemes: boolean;
  lightModeEnabled: boolean;
  onlineFeaturesEnabled: boolean;
  updateNotifyEnabled: boolean;
  integrationsEnabled: Readonly<Record<string, boolean>>;
  featureToggles: Readonly<Record<string, boolean>>;
  activeProfileName: string | null;
}

/** Runtime environment info — versions + locale + display context.
 *  Useful for integrations to behave differently across DS releases
 *  or under desktop vs. gamepad UI. */
export interface EnvironmentInfo {
  pluginVersion: string;
  apiVersion: number;
  locale: string;
  isGamepadUi: boolean;
}

/** Detected state for a third-party integration DS knows about. */
export interface IntegrationInfo {
  /** Stable identifier — matches the key under `integrationsEnabled` in
   *  persisted settings and the descriptor `id` exposed to consumers. */
  id: string;
  displayName: string;
  /** Whether the integration's underlying plugin / surface is present
   *  on the system. */
  installed: boolean;
  /** Whether the user has the integration enabled in DS settings.
   *  Always true unless the user explicitly opted out. */
  enabled: boolean;
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

export interface StatisticsProviderDescriptor {
  id: string;
  displayName: string;
  version?: string | number;
  /** Optional logical grouping when the host UI wants to bucket entries
   *  by provider category (e.g. "Library", "Playtime", "Online"). */
  category?: string;
  resolve(): Promise<ReadonlyArray<StatisticsEntry>> | ReadonlyArray<StatisticsEntry>;
}

export interface StatisticsEntry {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  category?: string;
}

export interface RecommendationProviderDescriptor {
  id: string;
  displayName: string;
  version?: string | number;
  /** Optional grouping when several providers contribute; the host
   *  uses this to render section headers. */
  category?: string;
  resolve(limit: number, signal?: AbortSignal): Promise<ReadonlyArray<RecommendationEntry>> | ReadonlyArray<RecommendationEntry>;
}

export interface RecommendationEntry {
  appid: number;
  /** Higher score sorts ahead. Defaults to 0 when omitted. */
  score?: number;
  /** Human-readable explanation surfaced under the card. */
  reason?: string;
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

  // --- Profiles + integrations (additive — no version bump) -------------
  getProfiles(): ReadonlyArray<PublicProfile>;
  getActiveProfile(): PublicProfile | null;
  subscribeProfiles(cb: (profiles: ReadonlyArray<PublicProfile>) => void): Unsubscribe;
  getIntegrations(): ReadonlyArray<IntegrationInfo>;
  subscribeIntegrations(cb: (integrations: ReadonlyArray<IntegrationInfo>) => void): Unsubscribe;

  // --- Settings snapshot + environment ----------------------------------
  getSettingsSnapshot(): PublicSettingsSnapshot;
  subscribeSettingsSnapshot(cb: (snapshot: PublicSettingsSnapshot) => void): Unsubscribe;
  getEnvironment(): EnvironmentInfo;

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

  registerStatisticsProvider(d: StatisticsProviderDescriptor): Unsubscribe;
  getRegisteredStatisticsProviders(): ReadonlyArray<StatisticsProviderDescriptor>;
  registerRecommendationProvider(d: RecommendationProviderDescriptor): Unsubscribe;
  getRegisteredRecommendationProviders(): ReadonlyArray<RecommendationProviderDescriptor>;

  /** Register translations for a locale at runtime (external integrations).
   *  Deep-merges into the locale bundle; never overwrites built-in keys.
   *  Namespace your keys (e.g. `acme.*`) to avoid cross-plugin collisions. */
  registerTranslations(locale: string, dict: Record<string, string>): void;
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
