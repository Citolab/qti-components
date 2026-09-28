/**
 * Generate `custom-elements.json` when it does not exist yet.
 *
 * The manifest is a build output and is not committed. `.storybook/preview.ts` imports it, so
 * anything that loads the Storybook preview — the `stories` and `vrt` Vitest projects included —
 * fails on a fresh clone until it has been generated once. This runs as a Vitest global setup
 * (before any test file is loaded) and only pays the analyzer run when the file is missing.
 *
 * Deliberately "missing", not "stale": regenerating on every Vitest start would add the full
 * analyzer run to watch mode. `pnpm storybook` keeps it fresh while you work (analyzer --watch),
 * and `pnpm run cem` refreshes it by hand.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

export default function ensureManifest() {
  if (existsSync(join(root, 'custom-elements.json'))) return;
  console.log('custom-elements.json not found; generating it (pnpm run cem)…');
  execSync('pnpm run cem', { cwd: root, stdio: 'inherit' });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ensureManifest();
}
