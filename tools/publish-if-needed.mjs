#!/usr/bin/env node
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

const view = spawnSync('npm', ['view', packageRef, 'version', '--registry', 'https://registry.npmjs.org/'], {
  stdio: 'pipe',
  encoding: 'utf8'
});

if (view.status === 0) {
  console.log(`Skipping publish: ${packageRef} is already published.`);
  process.exit(0);
}

const publish = spawnSync('npm', ['publish', '--provenance', '--access', 'public', '--ignore-scripts'], {
  stdio: 'inherit'
});

process.exit(publish.status ?? 1);
