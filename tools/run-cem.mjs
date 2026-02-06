import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
let outdir;
let watch = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];

  if (arg === '--outdir') {
    outdir = args[i + 1];
    i += 1;
    continue;
  }

  if (arg === '--watch') {
    watch = true;
  }
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cemArgs = ['analyze', '--config', 'custom-elements-manifest.config.mjs'];

if (watch) {
  cemArgs.push('--watch');
}

const env = { ...process.env };
if (outdir) {
  env.CEM_OUTDIR = outdir;
}

const result = spawnSync('cem', cemArgs, {
  cwd: repoRoot,
  env,
  stdio: 'inherit'
});

process.exit(result.status ?? 1);
