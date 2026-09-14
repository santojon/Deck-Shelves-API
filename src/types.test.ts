import { describe, expectTypeOf, it } from "vitest";
import type {
  ContextAwareShelfSourceDescriptor,
  ExternalShelfSourceDescriptor,
  ShelfResolveContext,
} from "./types";

/* Type-level tests for the context-aware shelf source additions. These have
   no runtime behavior of their own — the point is that `tsc --noEmit` (via
   `pnpm run typecheck`) fails to compile if any assertion here goes false,
   catching a future breaking change to these interfaces that `vitest run`
   alone (esbuild transform, no type-checking) would otherwise miss. The
   helper functions below are declared but never invoked — only their
   signatures need to type-check, so nothing here calls a stubbed descriptor
   at runtime. */
describe("ContextAwareShelfSourceDescriptor — backward compatibility", () => {
  it("is assignable wherever a plain ExternalShelfSourceDescriptor is expected", () => {
    expectTypeOf<ContextAwareShelfSourceDescriptor>().toExtend<ExternalShelfSourceDescriptor>();
  });

  it("keeps resolve() callable with just `limit`, matching the base contract", () => {
    // Compiles only if every parameter past `limit` stayed optional.
    function callWithJustLimit(resolve: ContextAwareShelfSourceDescriptor["resolve"]) {
      return resolve(10);
    }
    expectTypeOf(callWithJustLimit).returns.toEqualTypeOf<Promise<number[]> | number[]>();
  });

  it("resolve() accepts the full (limit, params, context, signal) call shape", () => {
    function callWithFullContext(
      resolve: ContextAwareShelfSourceDescriptor["resolve"],
      context: ShelfResolveContext,
    ) {
      return resolve(10, { foo: "bar" }, context, new AbortController().signal);
    }
    expectTypeOf(callWithFullContext).returns.toEqualTypeOf<Promise<number[]> | number[]>();
  });

  it("ShelfResolveContext's fields stay nullable (the 'no focus' case)", () => {
    expectTypeOf<ShelfResolveContext>().toEqualTypeOf<{
      focusedAppid: number | null;
      shelfId: string | null;
    }>();
  });
});
