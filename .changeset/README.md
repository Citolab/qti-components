# Changesets

Add a changeset in feature/fix PRs that change published package behavior:

```bash
pnpm run changeset
```

Commit the generated markdown file under `.changeset/`.

The `Manual: release and publish packages (changesets)` workflow consumes pending changesets, versions packages, and publishes them.
