/**
 * Post-build script that fixes a Stencil bug where dist/esm/index.js references
 * entry chunks by their concatenated component-name (e.g.
 * "dl-item-card.dl-item-tooltip.dl-provider.dl-shop-panel.entry.js") but the
 * rollup output uses a _N suffix scheme (e.g. "dl-item-card_4.entry.js").
 *
 * The mismatch causes "Module not found" for any consumer that imports from
 * the package root (e.g. `import { Language } from '@deadlock-api/ui-core'`).
 *
 * This script reads the actual .entry.js files present in the ESM dir and
 * rewrites index.js to reference the ones that exist.
 *
 * Usage: node scripts/fix-stencil-entry-refs.mjs <dist-esm-dir>
 */
import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, resolve, basename } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node scripts/fix-stencil-entry-refs.mjs <dist-esm-dir>');
  process.exit(1);
}

const ESM = resolve(dir);
const INDEX = join(ESM, 'index.js');

const entries = await readdir(ESM);
const actualEntryFiles = entries.filter(f => f.endsWith('.entry.js'));

let index = await readFile(INDEX, 'utf8');
let changed = false;

for (const match of index.matchAll(/from '(\.\/[^']+\.entry\.js)'/g)) {
  const referenced = match[1].replace(/^\.\//, '');
  try {
    await access(join(ESM, referenced));
  } catch {
    // file doesn't exist — find a real entry file that exports the same names
    const refBase = referenced.replace('.entry.js', '');
    const components = refBase.split('.');

    const replacement = actualEntryFiles.find(f => {
      // _N suffix file: first component name must match
      const fBase = f.replace('.entry.js', '');
      return fBase.startsWith(components[0]);
    });

    if (replacement && replacement !== referenced) {
      index = index.replace(match[1], `./${replacement}`);
      changed = true;
      console.log(`fixed entry ref: ${referenced} → ${replacement}`);
    } else {
      console.warn(`could not resolve broken ref: ${referenced}`);
    }
  }
}

if (changed) {
  await writeFile(INDEX, index, 'utf8');
}
