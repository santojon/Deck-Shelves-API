/**
 * @deck-shelves/api — tiny consumer API for Deck Shelves.
 *
 * Consumers do:
 *
 *   import { register } from '@deck-shelves/api';
 *
 *   const off = register({
 *     name: 'my-plugin',
 *     version: '1.0.0',
 *     onMount(api) {
 *       api.registerShelfSource({ ... });
 *       api.subscribeFocusedCard((info) => { ... });
 *     },
 *     onUnmount() { ... },
 *   });
 *
 * The API is dependency-free and handles three timing cases:
 *   1. Deck Shelves already loaded → register synchronously.
 *   2. Deck Shelves loads later → queue + register on its ready event.
 *   3. Consumer module loads after DS ready event already fired → still
 *      registers immediately via the queue drain.
 *
 * The returned `Unsubscribe` works in every case; calling it before DS
 * loads removes the pending entry, after it loads calls the live
 * `Unsubscribe` returned by `deckShelves.register`.
 */

import type {
  DeckShelvesIntegration,
  DeckShelvesGlobal,
  Unsubscribe,
} from "./types";

export * from "./types";

/** Symbol-keyed pending queue. Symbols avoid name collisions with other
 *  consumers and keep the global namespace clean. */
const PENDING_KEY = Symbol.for("deck-shelves/pending");
const READY_EVENT = "deck-shelves:ready";

type PendingEntry = {
  integration: DeckShelvesIntegration;
  unsub?: Unsubscribe;
  cancelled?: boolean;
};

function getGlobal(): typeof globalThis {
  // Browser, web-worker, node test harness — all expose globalThis.
  return globalThis;
}

function getDeckShelves(): DeckShelvesGlobal | null {
  const g = getGlobal() as { deckShelves?: DeckShelvesGlobal };
  return g.deckShelves ?? null;
}

function getPendingQueue(): PendingEntry[] {
  const g = getGlobal() as Record<symbol, unknown>;
  const existing = g[PENDING_KEY];
  if (Array.isArray(existing)) return existing as PendingEntry[];
  const fresh: PendingEntry[] = [];
  g[PENDING_KEY] = fresh;
  return fresh;
}

/** Register an integration with Deck Shelves. Returns an unregister
 *  function. Safe to call before or after the plugin loads. */
export function register(integration: DeckShelvesIntegration): Unsubscribe {
  const ds = getDeckShelves();
  if (ds && typeof ds.register === "function") {
    return ds.register(integration);
  }
  const entry: PendingEntry = { integration };
  const queue = getPendingQueue();
  queue.push(entry);
  // Hook the ready event so the entry processes itself. The plugin also
  // drains the queue on install, so this listener is a safety net for
  // consumers that load after the install but before the event listener
  // gets attached.
  const handler = () => {
    if (entry.cancelled) return;
    const ds2 = getDeckShelves();
    if (ds2 && typeof ds2.register === "function") {
      try { entry.unsub = ds2.register(entry.integration); } catch {}
    }
    try { (globalThis as typeof window).removeEventListener?.(READY_EVENT, handler); } catch {}
  };
  try { (globalThis as typeof window).addEventListener?.(READY_EVENT, handler); } catch {}
  return () => {
    entry.cancelled = true;
    try { entry.unsub?.(); } catch {}
    // Remove from queue if still pending (plugin hasn't drained yet).
    const idx = queue.indexOf(entry);
    if (idx >= 0) queue.splice(idx, 1);
  };
}

/** Returns the live `DeckShelvesPublicAPI` if Deck Shelves is loaded,
 *  else null. Most consumers should use `register()` and receive the API
 *  via `onMount(api)`; this helper is for short-lived scripts (dev tools,
 *  manual probes) that need direct access. */
export function getApi(): DeckShelvesGlobal["api"] | null {
  return getDeckShelves()?.api ?? null;
}

/** True iff Deck Shelves is loaded and the global has been installed. */
export function isReady(): boolean {
  return getDeckShelves() !== null;
}
