/**
 * Fails when a release would bump a workspace package but leave the umbrella
 * `@citolab/qti-components` behind — which means not publishing it at all.
 *
 * Why no Changesets option can do this:
 *
 * The umbrella reaches every `@qti-components/*` package through **devDependencies** (see
 * `packages/qti-components/package.json`), because tsup bundles their code into its own
 * `dist` rather than shipping them as runtime deps. Changesets deliberately refuses to bump
 * a dependent reached that way. From `@changesets/assemble-release-plan`,
 * `determine-dependents.ts`:
 *
 *     case "devDependencies": {
 *       // We don't need a version bump if the package is only in the devDependencies
 *       // of the dependent package
 *       if (type !== "major" && type !== "minor" && type !== "patch") type = "none";
 *     }
 *
 * That is hard-coded, not configurable. Things that look like they should help, and don't:
 *
 *   updateInternalDependents: "always"  Only changes the *condition* for entering that
 *                                       switch. devDependencies still map to "none".
 *   fixed / linked groups               Force one shared version number. The umbrella is on
 *                                       7.x and the workspace packages on 1.x.
 *   updateInternalDependencies          Sets the *level* of a dependent bump, not whether
 *                                       devDependencies produce one.
 *   workspace:^ being too loose         Not the cause. Changesets expands `workspace:^` to
 *                                       `^<oldVersion>`, so 2.0.0 does read as out of range.
 *
 * Moving the deps to `dependencies` or `peerDependencies` would make Changesets bump the
 * umbrella natively, but both are wrong for a package whose whole point is to bundle: the
 * first ships ten copies of code that is already inside `dist`, the second makes consumers
 * install them by hand. So the policy lives here.
 *
 * A stale version number is not the failure mode. `tools/publish-if-needed.mjs` asks npm
 * whether `@citolab/qti-components@<version>` exists and exits 0 when it does, so an
 * unbumped umbrella is silently **not published** — by `changeset publish` and by
 * `ci:publish:umbrella` alike. The changes ship to the `@qti-components/*` scope and reach
 * no `@citolab/qti-components` consumer, while every step of the release run reports success.
 *
 * The rule: the umbrella's bump must be at least as large as the largest bump any other
 * package receives in the same release.
 *
 *   major elsewhere  →  umbrella major   (their break is a break here; the code is bundled)
 *   minor elsewhere  →  umbrella minor
 *   patch elsewhere  →  umbrella patch   (without it the fix is never published at all)
 *
 * Patch is deliberately included. It is the easiest case to wave away and the one that
 * actually bit: a patch-only release leaves the umbrella on its published version, and
 * publish-if-needed skips it.
 *
 * The release plan comes from Changesets' own `getReleasePlan`, so this file holds the policy
 * and nothing else — no changeset parsing, no workspace globbing, no guess at what is
 * publishable. Private packages, `ignore`, pre-mode and dependent bumps are already resolved
 * by Changesets itself.
 *
 * Why the programmatic API and not the `changeset status --output` CLI, which is what the rest
 * of the release scripts shell out to: `status` resolves its optional `--since` to
 * `config.baseBranch` and runs `git merge-base main HEAD`. A PR checkout has no local `main`,
 * only `origin/main`, so the command exits non-zero — this check failed that way on its own
 * first CI run. And `--since` is not the fix: it is passed through to `readChangesets`, which
 * then returns only the changesets added since that ref. On `main` at release time that is a
 * PARTIAL plan, which for a guard is worse than no guard. `getReleasePlan` touches git at all
 * only when handed a `sinceRef`, and it is deliberately not handed one here. Its plan was
 * checked release-for-release against `changeset status --output` from CLI v3.0.1, the version
 * CI resolves: identical. (CLI v2 differs on one private app, `@qti-components/e2e`, which it
 * patch-bumps as a dependent where v3 leaves it `none`. Private packages are never published,
 * so they cannot be the reason the umbrella needs a release; `none` is filtered out below, and
 * if a future version reports one as a real bump the worst case is a spurious demand for an
 * umbrella patch.)
 *
 * Usage:  node tools/changesets/check-umbrella-bump.mjs [release-plan.json]
 *         (wired up as `pnpm run changeset:check-umbrella`, and as a step in ci.yml's
 *         changeset-check job and release.yml)
 */
import { getReleasePlan } from '@changesets/get-release-plan';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const UMBRELLA = '@citolab/qti-components';

/** Bump types, smallest first — the index is the comparison rank. */
const BUMPS = ['patch', 'minor', 'major'];

const rank = bump => BUMPS.indexOf(bump);

/** Changesets' own release plan: what `changeset version` is about to do. */
function releasePlan() {
  const given = process.argv[2];

  // A plan on disk, for testing the policy against a fixture without a workspace.
  return given ? JSON.parse(readFileSync(given, 'utf8')) : getReleasePlan(root);
}

const releases = (await releasePlan()).releases.filter(release => release.type !== 'none');

const umbrella = releases.find(release => release.name === UMBRELLA);
const others = releases.filter(release => release.name !== UMBRELLA);

const required = others.reduce((largest, release) => Math.max(largest, rank(release.type)), -1);
const covered = umbrella ? rank(umbrella.type) : -1;

if (required === -1) {
  console.log('✅ No pending release bumps a workspace package. Nothing to check.');
  process.exit(0);
}

const describe = release => `${release.name} ${release.oldVersion} → ${release.newVersion} (${release.type})`;

if (covered >= required) {
  console.log(`✅ ${describe(umbrella)} covers the largest workspace bump (${BUMPS[required]}).`);
  process.exit(0);
}

const needed = BUMPS[required];
const driving = others.filter(release => rank(release.type) === required);

console.error(`❌ This release bumps a workspace package ${needed}, but ${UMBRELLA} is not covered.`);
console.error('');
console.error(`   largest workspace bump: ${needed}`);
for (const release of driving.slice(0, 8)) {
  console.error(`     · ${describe(release)} — ${release.changesets.map(name => `${name}.md`).join(', ')}`);
}
if (driving.length > 8) {
  console.error(`     · …and ${driving.length - 8} more`);
}
console.error('');
console.error(
  umbrella
    ? `   ${UMBRELLA}: only ${umbrella.oldVersion} → ${umbrella.newVersion} (${umbrella.type}).`
    : `   ${UMBRELLA}: no changeset names it.`
);
console.error('');
console.error('   The umbrella bundles these packages into its own dist, so their change ships inside it,');
console.error('   but a devDependency link does not bump a dependent and tools/publish-if-needed.mjs skips');
console.error(`   a version already on npm — so without this the change never reaches ${UMBRELLA}.`);
console.error('');
console.error('   Fix: add this line to one changeset in .changeset/, or write a new one for it:');
console.error('');
console.error(`     '${UMBRELLA}': ${needed}`);
console.error('');

process.exit(1);
