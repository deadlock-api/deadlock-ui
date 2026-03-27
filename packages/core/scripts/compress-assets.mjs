#!/usr/bin/env node

/**
 * Compresses PNG and WebP images in src/assets/ using sharp.
 *
 * Uses a manifest (.assets-manifest.json) to track file hashes and skip
 * files that have already been compressed. Safe to run multiple times.
 *
 * Usage:
 *   node scripts/compress-assets.mjs
 *   node scripts/compress-assets.mjs --force   # re-compress everything
 */

import sharp from 'sharp';
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ASSETS_DIR = join(ROOT, 'src', 'assets');
const MANIFEST_PATH = join(ROOT, '.assets-manifest.json');

const force = process.argv.includes('--force');

function md5(buffer) {
  return createHash('md5').update(buffer).digest('hex');
}

async function findFiles(dir, exts) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findFiles(full, exts));
    } else if (exts.includes(extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

async function compressFile(filePath, buffer) {
  const ext = extname(filePath).toLowerCase();

  if (ext === '.png') {
    return sharp(buffer)
      .png({ quality: 80, compressionLevel: 9, palette: true })
      .toBuffer();
  }

  if (ext === '.webp') {
    return sharp(buffer)
      .webp({ quality: 75 })
      .toBuffer();
  }

  return null;
}

async function main() {
  const manifest = force ? {} : await loadManifest();
  const files = await findFiles(ASSETS_DIR, ['.png', '.webp']);

  let compressed = 0;
  let skipped = 0;
  let totalSaved = 0;

  console.log(`Found ${files.length} image(s) to check.\n`);

  for (const filePath of files) {
    const relative = filePath.slice(ROOT.length + 1);
    const original = await readFile(filePath);
    const hash = md5(original);

    if (manifest[relative]?.hash === hash) {
      skipped++;
      continue;
    }

    const result = await compressFile(filePath, original);
    if (!result) continue;

    // Only write if we actually saved bytes
    if (result.length < original.length) {
      const saved = original.length - result.length;
      totalSaved += saved;
      await writeFile(filePath, result);
      const newHash = md5(result);
      manifest[relative] = { hash: newHash, originalSize: original.length, compressedSize: result.length };
      console.log(`  ${relative}: ${original.length} → ${result.length} (${((saved / original.length) * 100).toFixed(1)}% saved)`);
      compressed++;
    } else {
      // File is already optimal, record current hash to skip next time
      manifest[relative] = { hash, originalSize: original.length, compressedSize: original.length };
      skipped++;
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\nDone!`);
  console.log(`  Compressed: ${compressed}`);
  console.log(`  Skipped:    ${skipped}`);
  console.log(`  Saved:      ${(totalSaved / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
