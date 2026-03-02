#!/usr/bin/env node
/**
 * Why this script exists:
 * - Added during the manual-release pipeline refactor (umbrella-driven publish + Storybook deploy).
 * - You asked for publishing to be idempotent: do not fail if a package version is already on npm.
 * - You also asked to only publish when a version is not yet published, and to fail on real infra/auth errors.
 *
 * Why it lives in-repo:
 * - It gives every package in `packages/*` one shared, auditable publish behavior.
 * - CI and local/manual release use the same logic, avoiding workflow-specific shell duplication.
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const pkgPath = resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const { name, version } = pkg;

if (!name || !version) {
  console.error('Missing package name or version in package.json');
  process.exit(1);
}

const packageRef = `${name}@${version}`;
const registry = 'https://registry.npmjs.org/';

const view = spawnSync('npm', ['view', packageRef, 'version', '--registry', registry], {
  stdio: 'pipe',
  encoding: 'utf8'
});

if (view.error) {
  console.error(`Failed to check publish state for ${packageRef}:`, view.error.message);
  process.exit(1);
}

if (view.status === 0) {
  console.log(`Skipping publish: ${packageRef} is already published.`);
  process.exit(0);
}

const viewOutput = `${view.stdout ?? ''}\n${view.stderr ?? ''}`.trim();
const isNotFound = /E404|404 Not Found|is not in this registry|No match found for version/i.test(viewOutput);

if (!isNotFound) {
  console.error(`Failed to verify whether ${packageRef} is published.`);
  if (viewOutput) {
    console.error(viewOutput);
  }
  process.exit(view.status ?? 1);
}

console.log(`Version not found in npm registry, publishing ${packageRef}.`);

const publish = spawnSync('npm', ['publish', '--provenance', '--access', 'public', '--ignore-scripts'], {
  stdio: 'inherit'
});

if (publish.error) {
  console.error(`Failed to publish ${packageRef}:`, publish.error.message);
  process.exit(1);
}

process.exit(publish.status ?? 1);
