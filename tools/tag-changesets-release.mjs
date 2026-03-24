#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const sinceShaIdx = args.indexOf('--since-sha');
const sinceSha = sinceShaIdx !== -1 ? args[sinceShaIdx + 1] : null;

if (!sinceSha) {
  console.error('Error: --since-sha <sha> is required');
  process.exit(1);
}

const exec = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();
const changedFiles = exec(`git diff --name-only ${sinceSha}..HEAD`)
  .split('\n')
  .filter(Boolean);

const changedPackageJsons = changedFiles.filter(file => /^(packages\/[^/]+\/[^/]+|packages\/[^/]+)\/package\.json$/.test(file));

if (changedPackageJsons.length === 0) {
  console.log('No changed package.json files since versioning commit start. No tags created.');
  process.exit(0);
}

const toTagPrefix = (packageJsonPath) => {
  if (packageJsonPath.startsWith('packages/interactions/')) {
    const folder = packageJsonPath.split('/')[2];
    return folder === 'core' ? 'interactions-core' : folder;
  }

  const folder = packageJsonPath.split('/')[1];
  if (folder === 'qti-components') {
    return 'qti-components';
  }

  // packages/qti-<name>/package.json => <name>
  return folder.replace(/^qti-/, '');
};

const tagsToCreate = [];

for (const packageJsonPath of changedPackageJsons) {
  const absolutePath = resolve(process.cwd(), packageJsonPath);
  const pkg = JSON.parse(readFileSync(absolutePath, 'utf8'));
  const version = pkg.version;

  if (!version) {
    continue;
  }

  const prefix = toTagPrefix(packageJsonPath);
  if (!prefix) {
    continue;
  }

  tagsToCreate.push(`${prefix}-v${version}`);

  // Preserve umbrella alias tag convention.
  if (prefix === 'qti-components') {
    tagsToCreate.push(`v${version}`);
  }
}

const uniqueTags = [...new Set(tagsToCreate)];
const headSha = exec('git rev-parse HEAD');

for (const tag of uniqueTags) {
  const existing = exec(`git tag --list '${tag}'`);

  if (!existing) {
    exec(`git tag ${tag}`);
    console.log(`Created tag ${tag}`);
    continue;
  }

  const existingSha = exec(`git rev-list -n 1 ${tag}`);
  if (existingSha === headSha) {
    console.log(`Tag ${tag} already exists on HEAD; keeping.`);
    continue;
  }

  console.error(`Error: tag ${tag} already exists on ${existingSha}, not HEAD ${headSha}.`);
  process.exit(1);
}
