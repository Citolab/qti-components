/**
 * A pre-`:state()` Chrome for the `legacy` Vitest project (`pnpm run test:legacy`).
 *
 * Chrome 120 is the stand-in for the browsers `packages/qti-base/src/utils/custom-state-set.ts`
 * shims: its `CustomStateSet` rejects bare names (`states.add('checked')` throws), and its CSS
 * parser drops any selector list containing `:state()`. So it exercises both halves of the
 * fallback — the shim's `data-state` attribute and the `[data-state~=…]` arms that
 * tools/postcss/custom-state-fallback.mjs writes into the theme.
 *
 * It is one of the two legacy profiles only. Safari 16.4–17.3 has no `states` at all (the
 * shim's `missing` path), and no old WebKit can be run locally: Playwright ships one WebKit per
 * release and does not support pinning an older one.
 *
 * Run as a script to download it; import `legacyChromePath()` to find it.
 *
 * The download is a Chrome for Testing zip, extracted with `ditto` on macOS. `@puppeteer/browsers`
 * fetches the same zip but its extraction breaks the app bundle's framework symlinks, and macOS
 * then kills the binary on launch (exit 137, "invalid or unsupported format for signature").
 *
 * Kept outside the repo (default `~/.cache/qti-components/`, override with
 * `QTI_LEGACY_CHROME_DIR`), so ~300 MB of browser is shared by every worktree and never seen by
 * lint, prettier or git.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LEGACY_CHROME_VERSION = '120.0.6099.109';

const PLATFORMS = {
  'darwin-arm64': {
    id: 'mac-arm64',
    executable: 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
  },
  'darwin-x64': {
    id: 'mac-x64',
    executable: 'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
  },
  'linux-x64': { id: 'linux64', executable: 'chrome-linux64/chrome' }
};

const platform = () => {
  const found = PLATFORMS[`${process.platform}-${process.arch}`];
  if (!found) throw new Error(`No Chrome for Testing build for ${process.platform}-${process.arch}`);
  return found;
};

const installDir = () =>
  path.join(
    process.env.QTI_LEGACY_CHROME_DIR ?? path.join(os.homedir(), '.cache', 'qti-components'),
    `chrome-${LEGACY_CHROME_VERSION}`
  );

/** The executable, or `undefined` when it has not been installed. */
export function legacyChromePath() {
  const executable = path.join(installDir(), platform().executable);
  return existsSync(executable) ? executable : undefined;
}

function install() {
  const existing = legacyChromePath();
  if (existing) {
    console.log(`Already installed: ${existing}`);
    return;
  }

  const { id } = platform();
  const dir = installDir();
  const zip = `${dir}.zip`;
  const url = `https://storage.googleapis.com/chrome-for-testing-public/${LEGACY_CHROME_VERSION}/${id}/chrome-${id}.zip`;

  mkdirSync(path.dirname(dir), { recursive: true });
  console.log(`Downloading ${url}`);
  execFileSync('curl', ['-sSfL', '-o', zip, url], { stdio: 'inherit' });

  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir);
  if (process.platform === 'darwin') execFileSync('ditto', ['-x', '-k', zip, dir], { stdio: 'inherit' });
  else execFileSync('unzip', ['-q', zip, '-d', dir], { stdio: 'inherit' });
  rmSync(zip);

  const executable = legacyChromePath();
  if (!executable) throw new Error(`Extracted, but no executable at ${path.join(dir, platform().executable)}`);
  console.log(execFileSync(executable, ['--version']).toString().trim());
  console.log(`Installed: ${executable}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) install();
