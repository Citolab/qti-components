// Create git tags for every public workspace package at its current version.
//
// `changeset publish` tags only what it publishes itself, and the reconcile step
// (`ci:publish:missing`) publishes via pnpm, which tags nothing. Deriving the tags
// from the versioned package.json files instead keeps tagging correct no matter
// which of the two paths actually pushed a package to npm.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const workspace = JSON.parse(execFileSync('pnpm', ['list', '-r', '--depth', '-1', '--json'], { encoding: 'utf8' }));

const existing = new Set(execFileSync('git', ['tag'], { encoding: 'utf8' }).split('\n'));
const created = [];

for (const { path } of workspace) {
  const pkg = JSON.parse(readFileSync(`${path}/package.json`, 'utf8'));
  if (pkg.private || !pkg.name || !pkg.version) continue;

  const tag = `${pkg.name}@${pkg.version}`;
  if (existing.has(tag)) continue;

  execFileSync('git', ['tag', '-a', tag, '-m', tag]);
  created.push(tag);
}

console.log(created.length ? `Created tags:\n${created.join('\n')}` : 'No new tags.');
