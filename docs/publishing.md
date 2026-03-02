# Publishing Packages

This workspace publishes all packages in `packages/*` to npm.

## Recommended Flow (Explicit Manual Release)

1. Merge conventional commits into `main`.
2. Manually run `.github/workflows/manual-release.yml` from GitHub Actions.
3. semantic-release runs in two phases:
   - all non-umbrella packages first
   - `@citolab/qti-components` second (umbrella release)
4. semantic-release analyzes commits, bumps package versions/changelogs, commits release changes, and creates component tags (`*-vX.Y.Z`).
5. The manual release workflow calls `.github/workflows/publish-packages.yml` when new release tags were created.
6. Push of the umbrella tag (`qti-components-vX.Y.Z`) triggers `.github/workflows/deploy-sb.yml` to deploy Storybook.

## Manual Fallback Flow

Use these root scripts when a manual or hotfix publish is needed:

- `pnpm run publish:all:dry-run`
- `pnpm run publish:all`
- `pnpm run publish:all:next`

The `:next` variant publishes with npm dist-tag `next`.

## Publish Workflow Inputs

`.github/workflows/publish-packages.yml` supports:

- `branch`: branch/ref to publish from (default `main`).

## Authentication (Trusted Publishing)

Publishing is configured for npm Trusted Publishing (GitHub OIDC), not long-lived `NPM_TOKEN`.

Required setup in npm:

1. In npm org/package settings, add GitHub trusted publishers for:
2. `.github/workflows/manual-release.yml` (branch `main`)
3. `.github/workflows/publish-packages.yml` (manual fallback)
4. Ensure both scopes are configured: `@citolab/*` and `@qti-components/*`.

Required setup in GitHub:

1. Add `RELEASE_GH_TOKEN` (PAT) secret for semantic-release if you want tag pushes to trigger downstream workflows.
2. Fallback `GITHUB_TOKEN` still works for releases, but workflow-trigger chaining from bot-created tags may be suppressed by GitHub recursion protection.

## Manual Release Workflow Inputs

`.github/workflows/manual-release.yml` supports:

- `branch`: branch to release from (default `main`).
- `dry_run`: run semantic-release in dry-run mode without creating tags/releases.

Implementation details in this repo:

1. Workflows grant `permissions: id-token: write`.
2. CI upgrades npm (`npm i -g npm@latest`) before publishing.
3. Publishing uses provenance (`--provenance` / `NPM_CONFIG_PROVENANCE=true`).

## Notes

- npm is the canonical registry target for this repository.
- `.github/workflows/publish-packages.yml` is the reusable publish workflow used by manual release and as a manual fallback.
- Storybook auto-deploy is intentionally restricted to umbrella tags (`qti-components-v*`) to avoid redundant deployments on every package tag.
- All publishable packages in `packages/*` include explicit `repository` metadata pointing to this GitHub repo and package directory.

## Pull Request StackBlitz Links

On each PR to `main`, `.github/workflows/pr-stackblitz-link.yml` posts and updates one bot comment with branch-specific StackBlitz links.

- Recommended quick-open link:
  - `https://stackblitz.com/github/Citolab/qti-components/tree/<url-encoded-branch>?startScript=storybook%3Astackblitz`
- Alternate links:
  - Root Storybook: `...?startScript=storybook%3Adev`
  - Interactions Storybook: `...?startScript=storybook%3Ainteractions`

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
