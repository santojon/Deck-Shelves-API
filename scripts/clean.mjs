#!/usr/bin/env node
// Cross-platform clean: remove dist/ and any *.tgz pack artifacts.
// Replaces `rm -rf dist *.tgz`, which does not exist on Windows cmd/PowerShell,
// so `pnpm run clean` works natively on Windows, macOS, and Linux.
import { rmSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

rmSync(resolve(root, "dist"), { recursive: true, force: true });
for (const entry of readdirSync(root)) {
  if (entry.endsWith(".tgz")) rmSync(resolve(root, entry), { force: true });
}
