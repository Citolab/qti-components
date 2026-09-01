// Print the CHANGELOG.md section for one version of the umbrella package,
// used as the body of the GitHub release.
import { existsSync, readFileSync } from 'node:fs';

const version = process.argv[2];
if (!version) {
  console.error('usage: release-notes.mjs <version>');
  process.exit(1);
}

const CHANGELOG = 'packages/qti-components/CHANGELOG.md';
const fallback = `Release ${version}.`;

if (!existsSync(CHANGELOG)) {
  console.log(fallback);
  process.exit(0);
}

// Changesets writes one `## <version>` section per release; take the lines between
// that heading and the next one.
const lines = readFileSync(CHANGELOG, 'utf8').split('\n');
const start = lines.findIndex(line => line.trim() === `## ${version}`);

let body = '';
if (start !== -1) {
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => line.startsWith('## '));
  body = (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();
}

console.log(body || fallback);
