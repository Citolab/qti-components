#!/usr/bin/env node
/**
 * bump-umbrella.mjs
 *
 * After semantic-release has tagged changed packages, this script:
 *   1. Finds packages that got new version tags since the given SHA
 *   2. Derives the highest bump type (patch/minor/major) across those packages
 *   3. Builds a rollup changelog entry from each changed package's CHANGELOG.md
 *   4. Updates the umbrella package version and CHANGELOG.md, creates a commit and tag
 *   5. Emits new_tag, new_version, and notes_file to GITHUB_OUTPUT (when in CI)
 *
 * Usage: node tools/bump-umbrella.mjs --since-sha <sha> [--dry-run]
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const sinceShaIdx = args.indexOf('--since-sha');
const sinceSha = sinceShaIdx !== -1 ? args[sinceShaIdx + 1] : null;

if (!sinceSha) {
  console.error('Error: --since-sha <sha> is required');
  process.exit(1);
}

const rootDir = process.cwd();
const umbrellaDir = resolve(rootDir, 'packages/qti-components');
const umbrellaPkgPath = resolve(umbrellaDir, 'package.json');
const umbrellaChangelogPath = resolve(umbrellaDir, 'CHANGELOG.md');
const notesFile = '/tmp/umbrella-release-notes.md';

const parseSemver = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : null;
};

const semverGt = (a, b) => {
  const pa = parseSemver(a), pb = parseSemver(b);
  if (!pa || !pb) return false;
  if (pa.major !== pb.major) return pa.major > pb.major;
  if (pa.minor !== pb.minor) return pa.minor > pb.minor;
  return pa.patch > pb.patch;
};

const getBumpType = (from, to) => {
  const a = parseSemver(from), b = parseSemver(to);
  if (!a || !b) return null;
  if (b.major > a.major) return 'major';
  if (b.minor > a.minor) return 'minor';
  if (b.patch > a.patch) return 'patch';
  return null;
};

const applyBump = (version, type) => {
  const v = parseSemver(version);
  if (!v) throw new Error(`Invalid version: ${version}`);
  if (type === 'major') return `${v.major + 1}.0.0`;
  if (type === 'minor') return `${v.major}.${v.minor + 1}.0`;
  if (type === 'patch') return `${v.major}.${v.minor}.${v.patch + 1}`;
  throw new Error(`Invalid bump type: ${type}`);
};

const bumpRank = { major: 3, minor: 2, patch: 1 };

const exec = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

// Emit a value to GITHUB_OUTPUT (supports multiline)
const outputToGitHub = (key, value) => {
  if (!process.env.GITHUB_OUTPUT) return;
  const delimiter = `delimiter_${Math.random().toString(36).slice(2)}`;
  appendFileSync(process.env.GITHUB_OUTPUT, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
};

const getTags = (ref) => {
  try {
    const out = exec(`git tag --list '*-v*.*.*' --merged ${ref}`);
    return new Set(out ? out.split('\n').filter(Boolean) : []);
  } catch {
    return new Set();
  }
};

// Tags reachable now vs tags reachable before the release — the difference is what's new
const headTags = getTags('HEAD');
const startTags = getTags(sinceSha);
const newTags = [...headTags].filter(t => !startTags.has(t) && !t.startsWith('qti-components-v'));

if (newTags.length === 0) {
  console.log('No new package tags since release started. Skipping umbrella bump.');
  process.exit(0);
}

console.log('New package tags:');
newTags.forEach(t => console.log(`  ${t}`));

// Group all known versions by package prefix for previous-version lookup
const tagsByPrefix = {};
for (const tag of headTags) {
  if (tag.startsWith('qti-components-v')) continue;
  const m = /^(.+)-v(\d+\.\d+\.\d+)$/.exec(tag);
  if (!m) continue;
  const [, prefix, version] = m;
  if (!tagsByPrefix[prefix]) tagsByPrefix[prefix] = [];
  tagsByPrefix[prefix].push(version);
}
for (const prefix of Object.keys(tagsByPrefix)) {
  tagsByPrefix[prefix].sort((a, b) => (semverGt(a, b) ? -1 : 1));
}

let highestBump = null;

for (const tag of newTags) {
  const m = /^(.+)-v(\d+\.\d+\.\d+)$/.exec(tag);
  if (!m) continue;
  const [, prefix, newVersion] = m;

  const versions = tagsByPrefix[prefix] ?? [];
  const newIdx = versions.indexOf(newVersion);
  const prevVersion = versions[newIdx + 1];

  if (!prevVersion) {
    console.log(`  ${tag}: first release — treating as minor`);
    if (!highestBump || bumpRank.minor > bumpRank[highestBump]) highestBump = 'minor';
    continue;
  }

  const bumpType = getBumpType(prevVersion, newVersion);
  console.log(`  ${prefix}: ${prevVersion} → ${newVersion} (${bumpType ?? 'no change'})`);

  if (bumpType && (!highestBump || bumpRank[bumpType] > bumpRank[highestBump])) {
    highestBump = bumpType;
  }
}

if (!highestBump) {
  console.log('Could not determine bump type. Skipping umbrella bump.');
  process.exit(0);
}

console.log(`\nHighest bump type across changed packages: ${highestBump}`);

const umbrellaPkg = JSON.parse(readFileSync(umbrellaPkgPath, 'utf8'));
const currentVersion = umbrellaPkg.version;
const newVersion = applyBump(currentVersion, highestBump);
const newTag = `qti-components-v${newVersion}`;
const aliasTag = `v${newVersion}`;

console.log(`Umbrella: ${currentVersion} → ${newVersion} (tag: ${newTag})`);

// Build rollup release notes from each changed package's CHANGELOG.md.
// Uses git diff to find which CHANGELOG.md files were modified since sinceSha,
// then extracts the most recent entry from each.
const extractLatestChangelogEntry = (changelogPath) => {
  if (!existsSync(changelogPath)) return null;
  const content = readFileSync(changelogPath, 'utf8');
  const lines = content.split('\n');
  const firstH2 = lines.findIndex(l => l.startsWith('## '));
  if (firstH2 === -1) return null;
  const secondH2 = lines.findIndex((l, i) => i > firstH2 && l.startsWith('## '));
  const entryLines = secondH2 !== -1 ? lines.slice(firstH2, secondH2) : lines.slice(firstH2);
  // Shift heading levels down one so they nest under the umbrella's ## heading
  return entryLines
    .map(l => l.startsWith('#') ? '#' + l : l)
    .join('\n')
    .trim();
};

const modifiedChangelogs = exec(`git diff --name-only ${sinceSha}..HEAD -- '**/CHANGELOG.md'`)
  .split('\n')
  .filter(p => p && !p.includes('qti-components/CHANGELOG.md'));

const packageSections = [];
for (const changelogRelPath of modifiedChangelogs) {
  const changelogPath = resolve(rootDir, changelogRelPath);
  const pkgJsonPath = resolve(changelogPath, '../package.json');
  if (!existsSync(pkgJsonPath)) continue;

  const pkgName = JSON.parse(readFileSync(pkgJsonPath, 'utf8')).name;
  const entry = extractLatestChangelogEntry(changelogPath);
  if (!entry) continue;

  packageSections.push(`### ${pkgName}\n\n${entry}`);
}

const date = new Date().toISOString().slice(0, 10);
const repoUrl = 'https://github.com/Citolab/qti-components';
const rollupBody = packageSections.length > 0
  ? packageSections.join('\n\n---\n\n')
  : 'Bumped to follow updated interaction packages.';

const changelogEntry = `## [${newVersion}](${repoUrl}/compare/qti-components-v${currentVersion}...${newTag}) (${date})\n\n${rollupBody}\n`;

if (dryRun) {
  console.log('\n[dry-run] Release notes preview:\n');
  console.log(changelogEntry);
  console.log('[dry-run] Skipping package.json update, CHANGELOG, commit, and tag.');
  process.exit(0);
}

// Update umbrella package.json
umbrellaPkg.version = newVersion;
writeFileSync(umbrellaPkgPath, JSON.stringify(umbrellaPkg, null, 2) + '\n');

// Prepend entry to umbrella CHANGELOG.md
const existingChangelog = existsSync(umbrellaChangelogPath) ? readFileSync(umbrellaChangelogPath, 'utf8') : '';
const lines = existingChangelog.split('\n');
const firstHeadingIdx = lines.findIndex(l => l.startsWith('# '));
const insertAt = firstHeadingIdx !== -1 ? firstHeadingIdx + 1 : 0;
lines.splice(insertAt, 0, '', changelogEntry);
writeFileSync(umbrellaChangelogPath, lines.join('\n'));

// Write release notes to a temp file for the GitHub release step
writeFileSync(notesFile, rollupBody);

// Emit outputs for the workflow
outputToGitHub('new_tag', newTag);
outputToGitHub('alias_tag', aliasTag);
outputToGitHub('new_version', newVersion);
outputToGitHub('notes_file', notesFile);

// Commit and tag
run(`git add packages/qti-components/package.json packages/qti-components/CHANGELOG.md`);
run(`git commit -m "chore(release): ${newVersion} [skip ci]"`);
run(`git tag ${newTag}`);
const aliasTagExists = execSync(`git tag --list '${aliasTag}'`, { encoding: 'utf8' }).trim().length > 0;
if (aliasTagExists) {
  const aliasTagSha = exec(`git rev-list -n 1 ${aliasTag}`);
  const headSha = exec('git rev-parse HEAD');
  if (aliasTagSha !== headSha) {
    console.error(`Error: alias tag ${aliasTag} already exists and points to ${aliasTagSha}, not HEAD ${headSha}.`);
    process.exit(1);
  }
  console.log(`Alias tag ${aliasTag} already exists on HEAD; keeping existing tag.`);
} else {
  run(`git tag ${aliasTag}`);
}

console.log(`\nUmbrella bumped to ${newVersion} and tagged as ${newTag} (alias: ${aliasTag}).`);
