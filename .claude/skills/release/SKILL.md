---
name: release
description: Release qti-components packages from main (manual) or check and trigger a prerelease from next (@next), dry run first, asking the user before every workflow run.
argument-hint: '<main | next>'
disable-model-invocation: true
---

# Release

Rules: `.claude/rules/releasing.md`. Ask the user before every `gh workflow run`.

1. **State**: `pnpm run changeset:status`; list the pending changesets and the packages and bump
   levels they produce. Nothing pending → nothing to release; say so.
2. **Lane check**: `main` must not have `.changeset/pre.json`; `next` must.
3. **Dry run** (ask): `gh workflow run release.yml -f branch=<lane> -f dry_run=true`, then
   `gh run watch` and report the versions it would publish.
4. **Release** (ask again): the same without `dry_run`.
   - `main`: `deploy-site.yml` follows on success; check it ran.
   - `next`: normally automatic after CI on a push to `next`; run by hand only when that did not
     happen. No site deploy.
5. Report: versions published, the GitHub release, and for `main` the site deploy.

Never `changeset publish`, `npm publish` or `pnpm publish` locally.
