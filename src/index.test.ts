import { afterEach, describe, expect, it, vi } from "vitest";
import { getApi, isReady, onReady, onTeardown, register } from "./index";
import type { DeckShelvesGlobal, DeckShelvesPublicAPI } from "./types";

const PENDING_KEY = Symbol.for("deck-shelves/pending");

function clearState() {
  delete (globalThis as { deckShelves?: unknown }).deckShelves;
  delete (globalThis as Record<symbol, unknown>)[PENDING_KEY];
}

function installDeckShelves(register: DeckShelvesGlobal["register"]) {
  (globalThis as unknown as { deckShelves: DeckShelvesGlobal }).deckShelves = {
    version: 4,
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

describe("onReady", () => {
  it("fires on a later microtask (never synchronously) when DS is already loaded", async () => {
    installDeckShelves(vi.fn());
    const cb = vi.fn();
    onReady(cb);
    expect(cb).not.toHaveBeenCalled();
    await Promise.resolve();
    await Promise.resolve();
    expect(cb).toHaveBeenCalledOnce();
  });

  it("fires once when the ready event dispatches (DS not yet loaded)", () => {
    const cb = vi.fn();
    onReady(cb);
    expect(cb).not.toHaveBeenCalled();
    installDeckShelves(vi.fn());
    globalThis.dispatchEvent?.(new Event("deck-shelves:ready"));
    expect(cb).toHaveBeenCalledOnce();
  });

  it("fires at most once even if the ready event dispatches twice", () => {
    const cb = vi.fn();
    onReady(cb);
    installDeckShelves(vi.fn());
    globalThis.dispatchEvent?.(new Event("deck-shelves:ready"));
    globalThis.dispatchEvent?.(new Event("deck-shelves:ready"));
    expect(cb).toHaveBeenCalledOnce();
  });

  it("does not fire after unsubscribe (pending path)", () => {
    const cb = vi.fn();
    const off = onReady(cb);
    off();
    installDeckShelves(vi.fn());
    globalThis.dispatchEvent?.(new Event("deck-shelves:ready"));
    expect(cb).not.toHaveBeenCalled();
  });

  it("swallows errors thrown by the callback", () => {
    const cb = vi.fn(() => { throw new Error("boom"); });
    onReady(cb);
    installDeckShelves(vi.fn());
    expect(() => globalThis.dispatchEvent?.(new Event("deck-shelves:ready"))).not.toThrow();
    expect(cb).toHaveBeenCalledOnce();
  });
});

describe("onTeardown", () => {
  it("fires the callback on every teardown event (not one-shot)", () => {
    const cb = vi.fn();
    const off = onTeardown(cb);
    globalThis.dispatchEvent?.(new Event("deck-shelves:teardown"));
    globalThis.dispatchEvent?.(new Event("deck-shelves:teardown"));
    expect(cb).toHaveBeenCalledTimes(2);
    off();
  });

  it("stops firing after unsubscribe", () => {
    const cb = vi.fn();
    const off = onTeardown(cb);
    off();
    globalThis.dispatchEvent?.(new Event("deck-shelves:teardown"));
    expect(cb).not.toHaveBeenCalled();
  });

  it("swallows errors thrown by the callback", () => {
    const cb = vi.fn(() => { throw new Error("boom"); });
    const off = onTeardown(cb);
    expect(() => globalThis.dispatchEvent?.(new Event("deck-shelves:teardown"))).not.toThrow();
    expect(cb).toHaveBeenCalledOnce();
    off();
  });
});
