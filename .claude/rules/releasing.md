---
paths:
  - '.changeset/**'
  - '.github/workflows/**'
  - 'tools/changesets/**'
  - '**/package.json'
  - '**/CHANGELOG.md'
---

# Releasing

Ask before every release and workflow run. Use the `/release` skill.

## `main`

Manual and deliberate; nothing publishes on merge.

1. Changesets accumulate in `.changeset/` as PRs land (`pnpm run changeset`).
2. `gh workflow run release.yml -f branch=main -f dry_run=true`, check, then without `dry_run`
   (or the "Manual: release and publish packages (changesets)" workflow).
3. On success `deploy-site.yml` deploys the Astro site (via `workflow_run`); a failed release does
   not. Manual redeploy: `gh workflow run deploy-site.yml`. Storybook is not published.

## `next` (`@next` on npm)

- Changesets pre mode (`.changeset/pre.json`): versions like `10.0.0-next.3` under the `next`
  dist-tag. A breaking changeset is `major`.
- Automatic: when CI succeeds on a push to `next`, `release.yml` (on `main`, via `workflow_run`)
  publishes the pending changesets. A push without one releases nothing. The release commit is
  `[skip ci]`. By hand: `gh workflow run release.yml -f branch=next -f dry_run=true`. The GitHub
  release is a prerelease; the site is not deployed.
- `tools/changesets/check-release-lane.mjs` refuses a branch other than `main` without `pre.json`,
  and `main` with it.

## Shipping the major

Cut a `9.x` maintenance branch from the last release, `pnpm exec changeset pre exit` on `next`,
merge `next` into `main`, release from `main`.

## Never

- `changeset publish` (crashes on this workspace's registry responses): `pnpm run ci:publish` runs
  `pnpm -r publish`, which skips versions already on npm and is safe to re-run.
- `npm pack` / `npm publish`: only pnpm rewrites `catalog:`.
- Editing `CHANGELOG.md` except to resolve a main → next sync conflict (the release's version
  commit is the likeliest one); that PR merges with a merge commit, never squash.
- Adding heavy verification to the pre-commit hook; it belongs in `.github/workflows/ci.yml`.
