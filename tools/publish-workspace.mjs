#!/usr/bin/env node
import { readdirSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const packagesDir = resolve(rootDir, 'packages');

const packageDirs = readdirSync(packagesDir)
  .map(name => resolve(packagesDir, name))
  .filter(dir => statSync(dir).isDirectory())
  .filter(dir => existsSync(resolve(dir, 'package.json')));

const failed = [];

for (const dir of packageDirs) {
  const label = dir.replace(`${rootDir}/`, '');
  console.log(`\n==> Publishing ${label}`);

  const result = spawnSync('node', ['../../tools/publish-if-needed.mjs'], {
    cwd: dir,
    stdio: 'inherit',
    env: process.env
  });

  if (result.status !== 0) {
    failed.push(label);
    console.error(`FAILED: ${label}`);
  } else {
    console.log(`DONE: ${label}`);
  }
}

if (failed.length > 0) {
  console.error('\nPublish failures:');
  for (const item of failed) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log('\nAll package publish tasks completed.');
