#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const packagesDir = path.join(rootDir, 'packages');
const argv = process.argv.slice(2);

const readArg = (name) => {
  const index = argv.indexOf(name);
  if (index === -1) {
    return null;
  }

  return argv[index + 1] ?? null;
};

const hasArg = (name) => argv.includes(name);

const packageName = readArg('--pkg');
const isDryRun = hasArg('--dry-run');

if (!packageName) {
  console.error('Missing required argument: --pkg <@qti-components/package-name>');
  process.exit(1);
}

if (!packageName.startsWith('@qti-components/')) {
  console.error(`Unsupported package "${packageName}". Only @qti-components/* packages are allowed.`);
  process.exit(1);
}

if (packageName === '@qti-components/qti-components' || packageName === '@citolab/qti-components') {
  console.error(
    'Umbrella package releases are handled by the manual umbrella workflow. Use @qti-components/* package names only.'
  );
  process.exit(1);
}

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env, ...options.env }
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const runAndRead = (command, args) => {
  const result = spawnSync(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: rootDir,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return result.stdout.trim();
};

const findPackageDirs = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const packageDirs = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name === 'node_modules' || entry.name === 'dist') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const packageJsonPath = path.join(fullPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      packageDirs.push(fullPath);
      continue;
    }

    packageDirs.push(...findPackageDirs(fullPath));
  }

  return packageDirs;
};

const packageDirs = findPackageDirs(packagesDir);
const manifestByName = new Map();

for (const packageDir of packageDirs) {
  const packageJsonPath = path.join(packageDir, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (typeof manifest.name === 'string' && manifest.name.length > 0) {
    manifestByName.set(manifest.name, { manifest, packageDir });
  }
}

const match = manifestByName.get(packageName);
if (!match) {
  console.error(`Could not find package "${packageName}" in workspace packages.`);
  process.exit(1);
}

const gitStatus = runAndRead('git', ['status', '--porcelain']);
if (gitStatus.length > 0) {
  console.error('Working tree is not clean. Commit or stash changes before releasing.');
  process.exit(1);
}

console.log(`Releasing ${packageName}${isDryRun ? ' (dry-run)' : ''}`);

run('pnpm', ['--filter', packageName, 'run', 'build']);
run('pnpm', ['--filter', packageName, 'run', 'test', '--if-present']);

run(
  'pnpm',
  [
    '--filter',
    packageName,
    'exec',
    '--',
    'semantic-release',
    ...(isDryRun ? ['--dry-run'] : []),
    '--no-ci'
  ],
  {
    env: { HUSKY: '0' }
  }
);

if (!isDryRun) {
  run('pnpm', ['--filter', packageName, 'run', 'publish']);
}

console.log(`Completed ${packageName}${isDryRun ? ' dry-run' : ' release'} flow.`);
