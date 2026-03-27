#!/usr/bin/env node

/**
 * Watches packages/core/dist/main/ for changes and copies to docs/static/.
 * Used during development to keep the docs preview in sync with the core build.
 */

import { watch, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'packages', 'core', 'dist', 'main');
const DEST_UI = join(ROOT, 'docs', 'static', 'deadlock-ui');
const DEST_ASSETS = join(ROOT, 'docs', 'static', 'assets');
const SRC_ASSETS = join(SRC, 'assets');

function copy() {
  try {
    cpSync(SRC, DEST_UI, { recursive: true });
    cpSync(SRC_ASSETS, DEST_ASSETS, { recursive: true });
    console.log(`[watch-copy] Synced core build → docs/static/`);
  } catch {
    // dist may not exist yet on first run, ignore
  }
}

// Initial copy
copy();

// Debounced watch
let timeout;
watch(SRC, { recursive: true }, () => {
  clearTimeout(timeout);
  timeout = setTimeout(copy, 500);
});

console.log('[watch-copy] Watching packages/core/dist/main/ for changes...');
