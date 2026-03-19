# Release process

This document explains how releasing works in this monorepo.

## Overview

Releases are **manual**. Commits flow to `main` freely; a release is triggered only when you explicitly run the workflow. This keeps the release cadence under human control without blocking regular development.

There are two categories of packages:

| Category | Examples | Versioned by |
|---|---|---|
| Individual packages | `@qti-components/choice-interaction`, `@qti-components/base`, … | semantic-release, per package |
| Umbrella package | `@citolab/qti-components` | `tools/bump-umbrella.mjs` |

---

## Running a release

Go to **Actions → Manual: release and publish packages** and click **Run workflow**.

| Input | Default | Description |
|---|---|---|
| `branch` | `main` | Branch to release from |
| `dry_run` | `false` | Preview what would happen without committing, tagging, or publishing |

Always do a dry-run first when in doubt.

---

## What happens step by step

### 1. semantic-release on all changed packages

`semantic-release` runs on every package in `packages/` and `packages/interactions/` except the umbrella. It analyzes conventional commits since each package's last tag and, if there are releasable changes:

- Bumps the version in `package.json`
- Writes a `CHANGELOG.md` entry
- Commits and tags (e.g. `choice-interaction-v1.2.0`)
- Creates a GitHub release for that package

Packages with no releasable commits since their last tag are skipped automatically.

### 2. Umbrella bump (`tools/bump-umbrella.mjs`)

The umbrella package (`@citolab/qti-components`) has no meaningful commits of its own — it re-exports the individual packages. Driving its version from conventional commits would require fake commits, so we derive it differently:

- Compare git tags reachable before and after step 1
- For each newly created tag, determine whether it was a patch, minor, or major bump by comparing to the previous tag of the same package
- Take the **highest** bump type across all changed packages and apply it to the umbrella version

This produces a rollup `CHANGELOG.md` entry that aggregates the most recent changelog section from each changed package, giving consumers a single place to see everything that changed.

### 3. Push, GitHub release, publish

- The umbrella commit and tag are pushed
- A GitHub release is created for the umbrella with the rollup release notes
- All packages (individual + umbrella) are published to npm via OIDC trusted publishing — the publish step is idempotent and skips anything already at that version on the registry

---

## Why the umbrella is handled separately

semantic-release determines release type by analyzing conventional commits. The umbrella has no domain commits of its own, so there is nothing for it to analyze. Previous iterations worked around this by injecting a fake `chore(release): umbrella minor` commit and using a custom semantic-release plugin to parse it. That approach worked but was fragile and required a separate manual workflow just for the umbrella.

The current approach replaces the fake-commit pattern with a script that reads the ground truth directly: what tags were just created, and how much did each package move?

---

## Adding a new interaction package

1. Create the package under `packages/interactions/<name>/`
2. Add `.releaserc.cjs` with a single line:
   ```js
   module.exports = { extends: ['../.releaserc.cjs'] };
   ```
   The shared config at `packages/interactions/.releaserc.cjs` derives the tag format from the folder name automatically.
3. That's it — the release workflow picks it up via the pnpm workspace filter.

---

## Local dry-run

To preview which packages would release and what versions they'd get, without touching git or npm:

```sh
pnpm run local:workspace-release:dry
```

This requires a `.env` file in the repo root with a `GITHUB_TOKEN` that has read access to the repo (needed by semantic-release to fetch tag history).

---

## Local scripts — gotchas

### `local:workspace-publish:force`

This is an emergency escape hatch to force-publish packages directly without going through semantic-release. It intentionally excludes the umbrella package (`@citolab/qti-components`) via `--filter "!./packages/qti-components"`.

**Do not remove that filter.** The umbrella has its own release process (`tools/bump-umbrella.mjs`) and its build depends on the individual packages being built and linked first. Force-publishing it out of order would likely publish a broken or stale build.
