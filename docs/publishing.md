# Publishing Packages

This workspace publishes all packages in `packages/*` to npm.

## Recommended Flow (Automated)

1. Merge conventional commits into `main`.
2. `release-please` updates release PRs and versions.
3. On release creation, `.github/workflows/publish.yml` publishes all releasable workspace packages.

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

## Authentication

Publishing requires `NPM_TOKEN` with permission to publish all target scopes:

- `@citolab/*`
- `@qti-components/*`

Recommended token setup:

1. Use an npm automation token in GitHub Actions secret `NPM_TOKEN`.
2. Ensure the token owner has package publish rights in both npm org scopes.
3. If npm 2FA is enabled, use an automation-compatible token.

## Notes

- Re-running publish for already-published versions can fail on npm with "version already exists".
- npm is the canonical registry target for this repository.

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
