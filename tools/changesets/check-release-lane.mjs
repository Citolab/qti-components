// Fails when the branch being released does not match its pre-release state.
// Usage: node tools/changesets/check-release-lane.mjs <branch>
// See release-lane.mjs for the rules.
import { existsSync } from 'node:fs';

import { laneProblem } from './release-lane.mjs';

const branch = process.argv[2];
if (!branch) {
  console.error('usage: check-release-lane.mjs <branch>');
  process.exit(1);
}

const problem = laneProblem(branch, existsSync('.changeset/pre.json'));
if (problem) {
  console.error(`❌ ${problem}`);
  process.exit(1);
}
console.log(`✅ ${branch} may release${branch === 'main' ? ' (stable, latest tag)' : ' (prerelease, next tag)'}.`);
