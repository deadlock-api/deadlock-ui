/**
 * Post-build script that strips Stencil's lazy-load dynamic import from the
 * dist-custom-elements output.
 *
 * Stencil's runtime ships a `import(`./${r}.entry.js...`)` call in a shared
 * chunk. In custom-elements mode this branch is unreachable (lazyLoad:!1),
 * but bundlers like Webpack and Turbopack statically analyze it and fail
 * with "Module not found: Can't resolve './'<dynamic>'.entry.js'" when the
 * package is consumed from node_modules.
 *
 * Replacing the dynamic import with Promise.reject() removes the static
 * reference without changing runtime behavior.
 *
 * Usage: node scripts/strip-lazy-import.mjs <dist-components-dir>
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node scripts/strip-lazy-import.mjs <dist-components-dir>');
  process.exit(1);
}

const ROOT = resolve(dir);

const LAZY_IMPORT_RE = /import\(`\.\/\$\{[^`]*?\.entry\.js[^`]*?`\)/g;

async function patchFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  if (!LAZY_IMPORT_RE.test(content)) return false;
  LAZY_IMPORT_RE.lastIndex = 0;
  const patched = content.replace(
    LAZY_IMPORT_RE,
    'Promise.reject(new Error("stencil lazy-load disabled in dist-custom-elements"))',
  );
  await writeFile(filePath, patched, 'utf8');
  return true;
}

async function walk(d) {
  const entries = await readdir(d, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(d, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith('.js') && (await patchFile(full))) {
      console.log(`stripped lazy import: ${full}`);
    }
  }
}

await walk(ROOT);
