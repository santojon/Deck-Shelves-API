import { afterEach, describe, expect, it, vi } from "vitest";
import { getApi, isReady, register } from "./index";
import type { DeckShelvesGlobal, DeckShelvesPublicAPI } from "./types";

const PENDING_KEY = Symbol.for("deck-shelves/pending");

function clearState() {
  delete (globalThis as { deckShelves?: unknown }).deckShelves;
  delete (globalThis as Record<symbol, unknown>)[PENDING_KEY];
}

function installDeckShelves(register: DeckShelvesGlobal["register"]) {
  (globalThis as unknown as { deckShelves: DeckShelvesGlobal }).deckShelves = {
    version: 3,
    api: {} as DeckShelvesPublicAPI,
    register,
  };
}

afterEach(() => {
  clearState();
  vi.restoreAllMocks();
});

describe("register", () => {
  it("registers synchronously when Deck Shelves is already loaded", () => {
    const unsub = vi.fn();
    const dsRegister = vi.fn(() => unsub);
    installDeckShelves(dsRegister);

    const integration = { name: "p", onMount() {} };
    const off = register(integration);

    expect(dsRegister).toHaveBeenCalledWith(integration);

    off();
    expect(unsub).toHaveBeenCalledOnce();
  });

  it("queues the integration when Deck Shelves is not yet loaded", () => {
    const integration = { name: "later", onMount() {} };
    const off = register(integration);

    const queue = (globalThis as Record<symbol, unknown>)[PENDING_KEY] as unknown[];
    expect(queue).toHaveLength(1);

    // Cancel so this test's ready-event listener doesn't leak into the
    // shared jsdom window and fire during later tests.
    off();
  });

  it("removes a still-pending integration from the queue when unsubscribed", () => {
    const off = register({ name: "cancel-me", onMount() {} });
    off();

    const queue = (globalThis as Record<symbol, unknown>)[PENDING_KEY] as unknown[];
    expect(queue).toHaveLength(0);
  });

  it("registers a queued integration when the ready event fires", () => {
    const unsub = vi.fn();
    const dsRegister = vi.fn(() => unsub);

    register({ name: "ready-path", onMount() {} });
    installDeckShelves(dsRegister);
    globalThis.dispatchEvent?.(new Event("deck-shelves:ready"));

    expect(dsRegister).toHaveBeenCalledOnce();
  });
});

describe("getApi / isReady", () => {
  it("reports not-ready and null api before Deck Shelves loads", () => {
    expect(isReady()).toBe(false);
    expect(getApi()).toBeNull();
  });

  it("exposes the live api once Deck Shelves is loaded", () => {
    installDeckShelves(vi.fn());
    expect(isReady()).toBe(true);
    expect(getApi()).not.toBeNull();
  });
});
