# Working on qti-components

This repo runs **trunk-based**: `main` is always releasable, changes land through
**short-lived branches** that merge as soon as CI is green.

## The four things you actually run

| command                | what it does                                             |
|------------------------|---------------------------------------------------------|
| `pnpm run storybook`   | dev server — Storybook + CEM watch                      |
| `pnpm run test`        | full suite — `build` + `vitest run`                    |
| `pnpm run changeset`   | describe a version bump (do this in your PR)            |
| `pnpm run yalc:push`   | push packages to local consumers                       |

Everything else is plumbing called by CI or the git hooks. You rarely touch it.
(A `Justfile` menu is planned — see `plans/package-scripts-reorg.md`.)

## Day-to-day: small change or refactor

Same flow either way — a refactor's branch just lives a bit longer. Keep branches
**short**: rebase on `main` often so you never drift far.

```bash
git switch -c feat/thing            # or fix/…, refactor/…
# …edit…
git commit -m "feat: thing"         # husky runs the fast checks (below)
pnpm run changeset                  # only if this changes a published package
git push -u origin HEAD
gh pr create --fill
gh pr merge --auto --squash         # merges itself the moment CI passes
```

`--auto` is the trunk-based trick: you open the PR and move on; GitHub squash-merges
it into `main` as soon as the required check is green. No long-lived branches, and
`main` stays gated.

> Direct `git push origin main` is disabled by the branch ruleset (below). That's the
> deal that makes "CI blocks bad code" real — a required check can only gate merges,
> not after-the-fact direct pushes.

## What runs on commit (husky pre-commit)

One tier, same on every branch, deliberately **fast** — see `.husky/pre-commit`:

1. `lint-staged` on **staged files only** — `prettier --write`, `eslint --fix`,
   and `vitest related` (the minimal tests for what you touched).
2. Regenerate the `custom-elements.json` manifests via `cem` (cheaper than a full build).

Heavy verification — full test suite, `madge`, `attw`, `publint` — is **CI's job**,
not the commit's. Don't add it here; you'll hate committing.

## The CI gate (how bad code is kept off main)

`.github/workflows/ci.yml` runs `pnpm run ci:push-quality`
(lint → madge → build → test → publint → attw) on every PR to `main`.

To make it **blocking**, `main` has a branch ruleset requiring:
- a pull request before merging,
- the `ci` check to pass,
- no direct pushes / force-pushes.

Set it up once with the GitHub CLI (admin):

```bash
gh api -X POST repos/Citolab/qti-components/rulesets \
  -f name='main-protection' \
  -f target='branch' \
  -f enforcement='active' \
  -f 'conditions[ref_name][include][]=refs/heads/main' \
  -f 'rules[][type]=pull_request' \
  -f 'rules[][type]=non_fast_forward' \
  -f 'rules[][type]=required_status_checks' \
  -F 'rules[][parameters][required_status_checks][][context]=ci'
```

> The status-check **context** is the job id `ci` from `ci.yml`. If GitHub reports it
> under a different name, open one PR, read the exact check name from the Checks tab,
> and use that. You can also configure this in the UI: **Settings → Rules → Rulesets → New**.
> Keep an admin-bypass entry so you're never locked out of an emergency fix.

## Releasing to npm (+ auto-publishing the site)

Releases are **deliberate and manual** — no accidental npm publishes.

1. During normal work, add changesets (`pnpm run changeset`) describing bumps. They
   accumulate in `.changeset/`.
2. When ready to ship, run the **release** workflow from the Actions tab
   (`Manual: release and publish packages (changesets)`), or:
   ```bash
   gh workflow run release.yml -f branch=main            # add -f dry_run=true to preview
   ```
   It versions the changesets, commits, builds, publishes to npm (OIDC trusted
   publishing), and pushes tags.
3. **On success, the Storybook site deploys automatically** — `deploy-sb.yml` is
   chained to the release via `workflow_run`. A failed release does *not* deploy.
   You can still deploy manually anytime (`gh workflow run deploy-sb.yml`).

## TL;DR

```
branch → commit (fast hooks) → PR → auto-merge on green → (later) run release → site redeploys itself
```
