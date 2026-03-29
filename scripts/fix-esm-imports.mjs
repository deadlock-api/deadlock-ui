/**
 * Post-build script to add .js extensions to relative imports in dist/.
 * Required for Node.js ESM resolution (e.g. Astro SSR).
 *
 * Stencil output targets generate bindings without .js extensions,
 * and tsc preserves that. This script fixes the compiled output.
 *
 * Usage: node scripts/fix-esm-imports.mjs <dist-dir>
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const distDir = process.argv[2];
if (!distDir) {
  console.error('Usage: node scripts/fix-esm-imports.mjs <dist-dir>');
  process.exit(1);
}

const DIST = resolve(distDir);

const RELATIVE_IMPORT_RE = /(from\s+['"])(\.\.?\/[^'"]+?)(?<!\.js)(['"])/g;

async function fixFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  const fixed = content.replace(RELATIVE_IMPORT_RE, '$1$2.js$3');
  if (fixed !== content) {
    await writeFile(filePath, fixed, 'utf8');
    console.log(`fixed: ${filePath}`);
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.name.endsWith('.js')) {
      await fixFile(full);
    }
  }
}

await walk(DIST);
