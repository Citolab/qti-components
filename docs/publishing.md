# Publishing Packages

This workspace publishes all packages in `packages/*` to npm.

## Recommended Flow (Explicit Manual Release)

1. Merge conventional commits into `main`.
2. Manually run `.github/workflows/semantic-release.yml` from GitHub Actions.
3. semantic-release analyzes commits, bumps package versions/changelogs, and creates component tags (`*-vX.Y.Z`).
4. Tag push triggers `.github/workflows/publish.yml`, which publishes workspace packages to npm (skipping already-published versions).

## Manual Fallback Flow

Use these root scripts when a manual or hotfix publish is needed:

- `pnpm run publish:all:dry-run`
- `pnpm run publish:all`
- `pnpm run publish:all:next`

The `:next` variant publishes with npm dist-tag `next`.

## Workflow Inputs

`.github/workflows/publish.yml` supports:

- `tag`: optional Git tag/ref to publish from.
- `dist_tag`: npm dist-tag (`latest` or `next`).

## Authentication (Trusted Publishing)

Publishing is configured for npm Trusted Publishing (GitHub OIDC), not long-lived `NPM_TOKEN`.

Required setup in npm:

1. In npm org/package settings, add GitHub trusted publishers for:
2. `.github/workflows/semantic-release.yml` (branch `main`)
3. `.github/workflows/publish.yml` (manual fallback)
4. Ensure both scopes are configured: `@citolab/*` and `@qti-components/*`.

Required setup in GitHub:

1. Add `RELEASE_GH_TOKEN` (PAT) secret for semantic-release if you want tag pushes to trigger downstream workflows.
2. Fallback `GITHUB_TOKEN` still works for releases, but workflow-trigger chaining from bot-created tags may be suppressed by GitHub recursion protection.

## Semantic Release Workflow Inputs

`.github/workflows/semantic-release.yml` supports:

- `branch`: branch to release from (default `main`).
- `dry_run`: run semantic-release in dry-run mode without creating tags/releases.

Implementation details in this repo:

1. Workflows grant `permissions: id-token: write`.
2. CI upgrades npm (`npm i -g npm@latest`) before publishing.
3. Publishing uses provenance (`--provenance` / `NPM_CONFIG_PROVENANCE=true`).

## Notes

- npm is the canonical registry target for this repository.
- `.github/workflows/publish.yml` is a manual emergency fallback path; semantic-release is the default release path.
- All publishable packages in `packages/*` include explicit `repository` metadata pointing to this GitHub repo and package directory.

## Pull Request StackBlitz Links

On each PR to `main`, `.github/workflows/pr-stackblitz-link.yml` posts and updates one bot comment with branch-specific StackBlitz links.

- Recommended quick-open link:
  - `https://stackblitz.com/github/Citolab/qti-components/tree/<url-encoded-branch>?startScript=storybook%3Astackblitz`
- Alternate links:
  - Root Storybook: `...?startScript=storybook%3Adev`
  - Interactions Storybook: `...?startScript=storybook%3Ainteractions`
  - Prosemirror Storybook: `...?startScript=storybook%3Aprosemirror`

Manual fallback:

1. Replace `<url-encoded-branch>` with your branch name (URL-encoded).
2. Open the link in browser.
3. StackBlitz starts Storybook from that branch without local setup.

## Pull Request Package Previews (`pkg.pr.new`)

On each PR to `main`, `.github/workflows/pr-pkg-pr-new.yml`:

1. Installs dependencies.
2. Builds the workspace.
3. Publishes preview package versions for `packages/*` using `pkg.pr.new`.

The workflow updates a PR comment with installable preview package URLs so you can test dependencies before a real npm release.
