#!/usr/bin/env node
/**
 * Why this script exists:
 * - Added/extended for the manual-release workflow you requested:
 *   run publish across all workspace packages, while keeping publish idempotent.
 * - It orchestrates per-package publish checks via `tools/publish-if-needed.mjs`.
 * - It publishes the umbrella package (`@citolab/qti-components`) last for deterministic release order.
 *
 * Why it lives in-repo:
 * - It centralizes workspace publish behavior so GitHub Actions and local/manual runs stay aligned.
 * - It avoids re-implementing package iteration/order logic in workflow YAML.
 */
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const packagesDir = resolve(rootDir, 'packages');
const umbrellaPackageName = '@citolab/qti-components';
const runnerContext =
  process.env.WORKSPACE_RELEASE_RUNNER_CONTEXT ??
  (process.env.GITHUB_ACTIONS === 'true' ? 'manual:workspace-release' : 'local:workspace-release');

function collectPackageDirs(dir) {
  const dirs = [];
  const entries = readdirSync(dir)
    .filter(name => !['node_modules', 'dist', '.turbo', '.git'].includes(name))
    .map(name => resolve(dir, name))
    .filter(p => statSync(p).isDirectory());

  for (const entry of entries) {
    if (existsSync(resolve(entry, 'package.json'))) {
      dirs.push(entry);
      continue;
    }

    dirs.push(...collectPackageDirs(entry));
  }

  return dirs;
}

const packageEntries = collectPackageDirs(packagesDir)
  .map(dir => {
    const pkgPath = resolve(dir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return {
      dir,
      label: dir.replace(`${rootDir}/`, ''),
      packageName: pkg.name ?? '',
      folderName: dir.replace(`${packagesDir}/`, '')
    };
  })
  .sort((a, b) => {
    const aUmbrella = a.packageName === umbrellaPackageName;
    const bUmbrella = b.packageName === umbrellaPackageName;

    if (aUmbrella !== bUmbrella) {
      return aUmbrella ? 1 : -1;
    }

    return a.folderName.localeCompare(b.folderName);
  });

const failed = [];

for (const entry of packageEntries) {
  const { dir, label } = entry;
  console.log(`\n[${runnerContext}] ==> Publishing ${label}`);

  const result = spawnSync('node', ['../../tools/publish-if-needed.mjs'], {
    cwd: dir,
    stdio: 'inherit',
    env: process.env
  });

  if (result.status !== 0) {
    failed.push(label);
    console.error(`[${runnerContext}] FAILED: ${label}`);
  } else {
    console.log(`[${runnerContext}] DONE: ${label}`);
  }
}

if (failed.length > 0) {
  console.error(`\n[${runnerContext}] Publish failures:`);
  for (const item of failed) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log(`\n[${runnerContext}] All package publish tasks completed.`);
