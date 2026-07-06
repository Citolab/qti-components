# Plan: Feature-branch prereleases under a dedicated npm dist-tag

## Goal

Publish the refactor branch's packages to npm as **prereleases under a `refactor` dist-tag**
(`x.y.z-refactor.N`), so the **editor** repo can `pnpm install` exact pinned versions — no `yalc`,
no git deps, no local linking. `main` keeps publishing `latest`; `refactor` never touches `latest`.

## Phase 0 — Corrected facts (READ FIRST — the prompt's assumptions are partly wrong)

- **Two scopes, independent version lines** (verified from package.json files):
  - `@citolab/qti-components` (umbrella) @ **7.28.1**
  - `@qti-components/*` (theme, interactions, interactions-core, and 20 individual interactions) @ **1.1.x–1.10.x**
  - ⇒ There is **no single `1.8.0`**. Each package prereleases from *its own* base version. The editor pins
    **per package**, e.g. `@citolab/qti-components@7.29.0-refactor.0` AND `@qti-components/match-interaction@1.1.6-refactor.0`.
- **Publishing goes through [tools/publish-if-needed.mjs](../tools/publish-if-needed.mjs)**, which builds the publish
  command at line 86 as `pnpm publish --access public --ignore-scripts --no-git-checks` — **no `--tag`**.
- **npm defaults every publish to the `latest` dist-tag, even for prerelease versions.** So publishing
  `-refactor.N` through the tool as-is **would clobber `latest`**. Fixing this is the central work item (Phase 1).
- **Auth:** `release.yml` uses **OIDC trusted publishing** (provenance) in GitHub Actions. Trusted publishing must be
  configured on npm for **both** scopes (`@citolab` and `@qti-components`) — already true for `latest` releases.
  Local publishing instead needs an npm token with publish rights to both scopes.
- **Changeset config** ([.changeset/config.json](../.changeset/config.json)): `baseBranch: main`, `access: public`,
  `changelog: false`, `commit: false`. Compatible with pre mode as-is; no changes required.
- **Prerelease semantics of Changesets pre mode:** `changeset pre enter refactor` writes `.changeset/pre.json`.
  From then on `changeset version` bumps *only packages that have a changeset* (plus internal dependents) to
  `-refactor.N`. Unchanged packages keep their `latest` version — the tool will skip them (already published).
  This is correct and coherent: the editor pins the prerelease versions for changed packages, stable for the rest.

### Alternative — `pkg-pr-new` / "pkgr" (already a devDep) with floating branch URLs
`pkg-pr-new` publishes per-commit builds installable via `https://pkg.pr.new/<owner>/<repo>/<pkg>@<ref>` URLs.
Crucially, **`<ref>` can be a branch name** — `…/@citolab/qti-components@refactor` always resolves to the *latest
CI build on that branch* (verified from the pkg.pr.new docs). So the editor can point at a floating branch and never
bump a version. Trade-offs vs. the npm dist-tag approach:

| | npm dist-tag `refactor` | pkgr branch URL |
|---|---|---|
| Editor update to newest | `pnpm up "@scope/*@refactor"` (one glob command, no copy-paste) | `pnpm update <pkgs>` to refetch the floating URL |
| Reproducible / exact pin | ✅ exact version pinned in lockfile | ❌ floats to latest branch build |
| Per-package editing | none (glob) | set each dep's URL **once** (then floating) |
| Touches npm registry | yes (under a non-`latest` tag) | no (separate service) |
| Cleanup | `npm dist-tag rm` | nothing — builds are ephemeral |
| Needs the tool/publish fix (Phase 1) | yes | no |

Chosen default: **npm dist-tag** (matches the stated "exact pins + plain install" goal and gives a one-command,
reproducible update). pkgr is the better fit if you'd rather have *zero* version management and don't need
reproducibility — see Phase 3 for both editor recipes.

### Anti-patterns to prevent
- ❌ Running `changeset version` in pre mode and publishing through the **unmodified** tool → clobbers `latest`.
- ❌ Assuming one shared version across packages.
- ❌ Pinning editor deps with a caret on a prerelease (`^1.1.6-refactor.0`) — range matching on prereleases is
  surprising; use **exact** versions.
- ❌ Unpublishing prereleases to "clean up" — npm blocks re-publishing the same version for 24h and discourages
  unpublish. Prereleases under a non-`latest` tag are harmless; retire the pointer with `npm dist-tag rm` instead.
- ❌ Forgetting to commit `.changeset/pre.json` — it is what keeps the branch in pre mode across CI runs.
- ❌ Pushing prerelease version-bump commits to `main` — they belong on the refactor branch only.

---

## Phase 1 — Teach the publish tool a dist-tag

**Edit [tools/publish-if-needed.mjs](../tools/publish-if-needed.mjs)** so it honors an optional dist-tag,
defaulting to current behavior (`latest`) when unset.

At the publishArgs construction (line ~86):
```js
const distTag = (process.env.PUBLISH_DIST_TAG ?? '').trim();

const publishArgs = ['publish', '--access', 'public', '--ignore-scripts', '--no-git-checks'];
if (distTag) {
  publishArgs.push('--tag', distTag);   // e.g. refactor → keeps these off `latest`
}
if (shouldUseProvenance()) {
  publishArgs.splice(1, 0, '--provenance');
}
```
The `npm view <name>@<version>` idempotency check is version-keyed and needs no change — a `-refactor.N` version
is looked up correctly.

**Verification (Phase 1):**
- `PUBLISH_DIST_TAG=refactor` → published command contains `--tag refactor` (add a temporary `console.log(publishArgs)`
  or dry-run in a scratch dir).
- Unset `PUBLISH_DIST_TAG` → command **unchanged** from today (no `--tag`). Confirms `latest` releases are unaffected.
- `pnpm run publint` / existing release still green.

---

## Phase 2 — A prerelease publish path

**Recommended: a manual-dispatch workflow** `.github/workflows/prerelease.yml`, mirroring `release.yml` but
prerelease-safe. Key differences from `release.yml`:

- Inputs: `branch` (the feature branch, e.g. `breaking-changes-for-editor-release`), `tag` (default `refactor`), `dry_run`.
- Checkout the **feature branch** (not main).
- **Enter pre mode if needed:** `if [ ! -f .changeset/pre.json ]; then pnpm dlx @changesets/cli pre enter "$TAG"; fi`
- `pnpm run changeset:version`  (produces `x.y.z-<tag>.N` for changed packages)
- `pnpm run build`
- **Publish with the dist-tag:** run the existing `ci:publish:*` scripts with `PUBLISH_DIST_TAG: <tag>` in `env`
  (they call the now-tag-aware tool). Reuse the same OIDC/npm_config unset dance as `release.yml`.
- Commit the version bumps + `.changeset/pre.json` back to the **feature branch** and push (records the versions).
- **Do NOT** deploy Storybook — `deploy-sb.yml` triggers only on the *release* workflow's name, so a prerelease
  won't fire it. (Confirm the name string doesn't match.)

Trigger it with:
```bash
gh workflow run prerelease.yml -f branch=breaking-changes-for-editor-release -f tag=refactor
# add -f dry_run=true first to preview versions
```

**Local alternative** (needs `npm login` with rights to both scopes — no provenance locally):
```bash
git switch <feature-branch>
pnpm changeset pre enter refactor      # once per branch; commit .changeset/pre.json
pnpm changeset                         # describe the changes
pnpm changeset version                 # → x.y.z-refactor.N
pnpm run build
PUBLISH_DIST_TAG=refactor pnpm run ci:publish:missing   # publishes via the tag-aware tool
git add -A && git commit -m "chore(prerelease): refactor.N" && git push
```
Optionally add `just prerelease` recipes wrapping these once the flow is settled.

**Verification (Phase 2):**
- `npm view @citolab/qti-components dist-tags` → `refactor: 7.x.y-refactor.N` **and `latest` UNCHANGED**.
- Same for a sample `@qti-components/*` package that had a changeset.
- The feature branch has a commit bumping versions + `.changeset/pre.json`; `main` is untouched.

---

## Phase 3 — Consume from the editor repo

You do **not** hand-copy versions. Pick one of the two update recipes.

### Recipe A — npm dist-tag (recommended, reproducible)
One-time: set the editor to pin exactly, so `up` writes fixed versions instead of caret ranges —
add to the **editor's** `.npmrc`:
```
save-exact=true
```
Then, to take the newest refactor build of **every** installed component package in one command:
```bash
pnpm up "@citolab/qti-components@refactor" "@qti-components/*@refactor"
git add package.json pnpm-lock.yaml && git commit -m "chore: bump components to latest refactor prerelease"
```
`pnpm up "@scope/*@tag"` resolves the `refactor` dist-tag and rewrites package.json + lockfile for all matching
deps — no per-package edits, no copy-paste. Result is exact-pinned and reproducible. Client then only needs
`pnpm install && pnpm dev`.

### Recipe B — pkgr floating branch URL (zero version management)
One-time per dependency, set the URL to the **branch** (floats to latest build):
```jsonc
// editor package.json
"dependencies": {
  "@citolab/qti-components": "https://pkg.pr.new/citolab/qti-components/@citolab/qti-components@<branch>",
  "@qti-components/match-interaction": "https://pkg.pr.new/citolab/qti-components/@qti-components/match-interaction@<branch>"
}
```
Thereafter, pull the newest branch build with:
```bash
pnpm update "@citolab/qti-components" "@qti-components/*"   # refetches the floating URLs
```
No npm publish, no `latest` risk, nothing to clean up. Downsides: not reproducible (floats), the URLs must be set
once per package, and availability depends on the pkg.pr.new service. Requires wiring a `pkg-pr-new publish` step
into CI on the refactor branch (it's already a devDep).

> Note on both: a plain `pnpm install` on an *existing* checkout won't pull a newer build on its own — the lockfile
> pins it. Use the `pnpm up`/`pnpm update` command above to advance. A *fresh clone* installs exactly what the
> committed lockfile says.

**Verification (Phase 3):** fresh clone of editor → `pnpm install && pnpm dev` runs against the chosen channel.

---

## Phase 4 — Graduate refactor → stable

```bash
git switch <feature-branch>
pnpm changeset pre exit          # leave pre mode; commit the removal of .changeset/pre.json
# open PR, merge feature branch → main (normal gated flow)
```
Then run the normal **release** workflow from `main` → publishes `latest`. Optionally retire the channel:
```bash
npm dist-tag rm @citolab/qti-components refactor
# repeat per @qti-components/* package if you want the tag gone
```

**Verification (Phase 4):** `npm view <pkg> dist-tags` shows the new stable under `latest`; `refactor` removed or
pointing at the final prerelease. Editor switched back to caret ranges on stable versions.

### Can I delete the prereleases afterward? (permanence reality)
No, not reliably. On the **public npm registry**:
- `npm unpublish <pkg>@<version>` works only **within 72 hours** of publishing; after that it's restricted (allowed
  only if nothing depends on it and downloads are negligible, else requires npm support).
- A published version number is **burned forever** — you can never republish that exact version, even after unpublish.

You don't need to delete them: prereleases under a non-`latest` tag are inert. To "retire" the channel, remove the
*pointer* (`npm dist-tag rm … refactor`) and/or `npm deprecate` the versions — the tarballs remain but nobody
resolves to them. **If genuinely-removable/temporary artifacts are required, don't use public npm** — use **pkgr**
(ephemeral by design, Recipe B) or **GitHub Packages** (you can delete versions anytime; editor auths via `.npmrc`
+ token). Trade-off: both give up the reproducible exact-pin property of the npm dist-tag approach.

---

## Phase 5 — Final verification checklist

1. `latest` never moved during any prerelease publish (checked in Phase 2).
2. Tool change is backward-compatible: an unset `PUBLISH_DIST_TAG` reproduces today's `latest` publish exactly.
3. `main`'s history contains no prerelease version-bump commits.
4. Editor installs with exact pins and runs.
5. Docs: add a "Prerelease channel" section to CONTRIBUTING.md summarizing Phases 2–4.

## Open decision for you

- **Publish channel:** workflow (recommended — reuses OIDC/provenance, no local tokens) **or** local commands
  (faster, but you need `npm login` with publish rights to both `@citolab` and `@qti-components`). Pick before Phase 2.
