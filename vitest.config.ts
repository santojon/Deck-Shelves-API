import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // jsdom gives us a real `window`/`addEventListener` so the
    // ready-event queue-drain path can be exercised the way consumers
    // hit it in a browser/Steam UI runtime.
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
