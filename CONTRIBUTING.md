# Working on qti-components

The rules for people and for Claude are the same, and live in one place:

- [`CLAUDE.md`](CLAUDE.md): commands, the repo map, the two lanes (`main`, `next`), how one change
  goes from start to finish, and the definition of done.
- [`.claude/rules/`](.claude/rules): the rules per area (Lit, interactions, stories, tests, QTI,
  theme, plugins, host API, docs, releasing). Read the one for the area you change.
- [`plans/ROADMAP.md`](plans/ROADMAP.md): the planned work, in order.
- [`packages/qti-theme/CONTRACT.md`](packages/qti-theme/CONTRACT.md): the styling contract.
- [`plans/host-api.md`](plans/host-api.md): what hosts may use and rely on.

## Quick start

```bash
pnpm install
pnpm run storybook   # the lab, port 6006
pnpm run test        # the stories and specs
```

## What runs on commit

`.husky/pre-commit`: the VRT comparison (skipped for docs-only commits), then `lint-staged` on the
staged files only (prettier, eslint, stylelint, and one `vitest run --changed`). Heavy checks
(madge, publint, attw, the full suite) run in CI (`.github/workflows/ci.yml`), not on commit.

## Branch protection

`main` has a ruleset: a pull request, the `ci` check green, no direct or force pushes. It was set up
once by an admin with:

```bash
gh api -X POST repos/Citolab/qti-components/rulesets \
  -f name='main-protection' -f target='branch' -f enforcement='active' \
  -f 'conditions[ref_name][include][]=refs/heads/main' \
  -f 'rules[][type]=pull_request' -f 'rules[][type]=non_fast_forward' \
  -f 'rules[][type]=required_status_checks' \
  -F 'rules[][parameters][required_status_checks][][context]=ci'
```

`next` has no required checks: a PR into `next` with `gh pr merge --auto` merges at once.
