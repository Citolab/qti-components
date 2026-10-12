# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@citolab/qti-components` is a web component library (built on Lit) that renders 1EdTech QTI
assessment items and tests. It's a pnpm monorepo; the umbrella `packages/qti-components` package
re-exports everything else for consumers who just want one install.

## Commands

| Command                    | What it does                                                         |
| -------------------------- | -------------------------------------------------------------------- |
| `pnpm install`             | install deps (msw postinstall writes `public/mockServiceWorker.js`)  |
| `pnpm run storybook`       | dev server — Storybook + CEM watch, port 6006                        |
| `pnpm run test`            | full suite: cleans build state, then `vitest run`                    |
| `pnpm run test:vrt`        | visual regression tests (`VRT=1`, only stories tagged `vrt`)         |
| `pnpm run test:vrt:update` | regenerate VRT baseline screenshots                                  |
| `pnpm run tsc`             | typecheck, no emit                                                   |
| `pnpm run lint`            | CEM regen + eslint + stylelint                                       |
| `pnpm run build`           | build all packages (`pnpm -r run build`)                             |
| `pnpm run changeset`       | describe a version bump (do this in your PR if it touches a package) |
| `pnpm run ci:push-quality` | full CI gate: lint → madge → build → test → publint → attw           |

Run a single test/story: use Vitest's normal filtering, e.g.
`vitest run --project tests -t "<name>"` or target a spec file path directly.
Vitest runs as three projects (`stories`, `vrt`, `tests`) — see `vitest.config.ts`; `vrt` only
exists when `VRT=1`. `tests` covers plain `*.spec.ts`/`*.test.ts` files; `stories` runs Storybook
stories in a real browser (Playwright/chromium) via `@storybook/addon-vitest`.

## Repo structure

- `packages/*` — one package per concern, published individually and re-exported from the
  `qti-components` umbrella (`packages/qti-components/src/{base,elements,interactions,item,test,
processing,transformers,loader,corrections}.ts`, one entry point per package):
  - `qti-base` — shared base classes/utilities used across all other packages.
  - `qti-elements` — QTI non-interaction elements (structural/content tags).
  - `interactions/*` — the interaction components, one subpackage each (`choice-interaction`,
    `text-entry-interaction`, `hotspot-interaction`, …) plus `interactions/core` for the shared
    mixins. This is where interaction code and its stories live; `AGENTS.md` here holds the rules.
  - `qti-interactions` — thin aggregator: re-registers every `interactions/*` subpackage
    (`elements.ts`, `register-all.ts`) for the umbrella package. No component code of its own.
  - `qti-item` — assembles elements/interactions into a renderable `qti-item`.
  - `qti-test` — assessment-test level components: navigation, sections, scoring, outcome
    processing, item-ref selection.
  - `qti-processing` — response/outcome processing engine (QTI expression evaluation).
  - `qti-transformers` — content transforms (e.g. XML/PCI transforms).
  - `qti-loader` — loads/parses QTI packages/items.
  - `qti-corrections` — formative-assessment correction overlays for interactions.
  - `qti-theme` — CSS theming; semantic styles live here, not in component packages (see
    Styling below).
  - `qti-utilities` — generic shared helpers with no QTI-specific semantics.
- `apps/*` — the docs/Storybook site app (`pnpm run docs`).
- `tools/` — build/test tooling (e.g. `tools/testing/pretest-clean.mjs`,
  `tools/changesets/*`).
- `.storybook/` — Storybook config; `cem.config.mjs` drives the custom-elements-manifest
  generator that Storybook docs and `custom-elements.json` depend on.

## Cross-package dependency rule

Runtime deps that must be a single instance across the whole workspace (`lit`, `lit-html`,
`@lit/context`, `@heximal/templates`, `storybook`) are pinned once in `pnpm-workspace.yaml`'s
`catalog:` and referenced as `"lit": "catalog:"` in every package — never write a literal version
range for these. A version split here causes duplicate Lit instances, which silently breaks
`instanceof` checks and `@consume`/context resolution with no error. Only `pnpm pack`/`pnpm
publish` rewrite `catalog:` correctly; `npm pack` does not, so packing must go through pnpm.

## Styling and theming (interaction packages)

- Functional/layout styles live in local `*.styles.ts` next to each interaction component and
  must stay minimal and non-semantic.
- Semantic/visual theming lives in `qti-theme` (`packages/qti-theme/src/styles/...`), not in
  component packages — interaction components must remain functional without that CSS loaded.

## Story architecture (interaction packages)

Applies to `packages/interactions/**` (see its local `AGENTS.md` for the full policy):

- Exactly one main docs story per component: `qti-*-interaction.stories.ts`; only that file uses
  `getStorybookHelpers(...)` and `tags: ['autodocs']`.
- Scenario/behavior stories live under a component's `stories/` directory using a fixed suffix
  taxonomy (`.a11y.`, `.api.`, `.behavior.`, `.config.`, `.correctresponse.`, `.dom.`, `.forms.`,
  `.theming.`, `.validation.`, `.vocabulary.`).
- Prefer testing-library-style queries (`getByRole`, `getByLabelText`, etc.) over
  `querySelector`/`shadowRoot?.querySelector` in story tests; exceptions need an inline rationale
  and an entry in that package's legacy exception table.
- A story test validates only its own interaction, even when it scaffolds another component
  (e.g. `qti-item`).
- Interactions must be form-associated custom elements exposing a11y state via
  `ElementInternals`; `response` is a transitional/compatibility API only.

## Working agreement

Two lanes, one backlog.

- **`main`** is the current major. Always releasable. Fixes and non-breaking features land here.
- **`next`** is the integration branch for the next major. Breaking and architectural changes land here.
- **The backlog is GitHub issues.** Nothing else holds open work. `plans/` is for design
  decisions only (e.g. `public-api.md`); a plan with open tasks turns those tasks into issues and
  is deleted when it ships.

### Choosing the lane

Ask: would this break an existing user of a published package (removed or renamed member, changed
behaviour, new required import)? No: `main`, no milestone. Yes: `next`, milestone "Next major".
When unsure, put the issue in "Next major" and decide at triage.

### One change, start to finish

1. Open or pick an issue. Say which lane it is in.
2. Make a worktree off that lane's branch (`origin/main` or `origin/next`), named after the branch:
   branch `fix/foo` → `.claude/worktrees/fix-foo`. Unset the upstream after `-b … origin/<base>`.
3. Add a changeset if a published package changes (`pnpm run changeset`). On `next` it is a
   `major` when the change breaks, otherwise `minor`/`patch`.
4. Open the PR **into the same lane's branch**. The title is a conventional commit
   (`feat(test): …`); it becomes the squash commit.
5. CI must pass. On `main`, a review is required. Squash-merge.
6. Remove the worktree and the local branch; delete the remote branch after merge.

Always name the branch, the worktree and the PR number together when talking about any one of them.

### Releasing

- **`main`:** manual, as in "Releasing" below.
- **After every `main` release, merge `main` into `next`.** _(Planned: a GitHub Action does this
  and opens a PR when it conflicts. Until it exists, do it by hand the same day: it keeps
  `package.json` versions and `CHANGELOG.md` conflicts small.)_
- **`next`:** prereleases publish as `@next` on npm so hosts can install and test them; see
  "Prereleases from `next`" under Releasing below. _(Pre mode is not entered on `next` yet: until
  `.changeset/pre.json` exists there, the release workflow refuses to release from `next`.)_
- **Shipping the major:** cut a `9.x` maintenance branch from the last release, merge `next` into
  `main`, leave pre-mode, release.

### Rules that bind Claude

- Ask before every commit, push, branch deletion and release. "Do what you think is best" is not
  permission.
- Never use `--admin` to get past a ruleset.
- Work in a worktree, not by switching branches in place.

## Git workflow

`main` is always releasable; changes land through short-lived branches merged on green CI.
`git push origin main` is blocked by branch ruleset — go through a PR.

Do each branch of work in its own git worktree rather than switching branches in place, so
multiple in-progress changes (and their `node_modules`/build state) don't collide:

```
git worktree add ../qti-components-feat-thing -b feat/thing
cd ../qti-components-feat-thing
pnpm install
# commit — husky pre-commit runs lint-staged (prettier, eslint --fix, vitest related) on staged files only
pnpm run changeset          # only if the change touches a published package
git push -u origin HEAD
gh pr create --fill
gh pr merge --auto --squash
cd -
git worktree remove ../qti-components-feat-thing
```

Heavy verification (`madge`, `attw`, `publint`, full test suite) runs in CI
(`.github/workflows/ci.yml`), not in the pre-commit hook — don't add it there.

When running inside a VS Code Agent Host session, do not create,
enter, or switch Git worktrees.

The VS Code Agent session already provides worktree isolation.
Perform all work in the current working directory.

## Host migration notes

`plans/public-api.md` lists each public member with the hosts that use it (K Kennisnet, C
CitoTestUit, P PeilingLezen). `plans/host-migration/{kennisnet,citotestuit,peilinglezen}.md` say
what each host must do. In the same commit as the change:

- A change that touches a member in `public-api.md` adds or updates the entries for every host
  whose letter is in that row, and its changeset links to them.
- When a change gives hosts a better or simpler way to do something (a new member replacing a
  workaround), write it into the affected hosts' files as a `recommended` entry, naming the
  workaround it replaces.
- When a survey shows a host using a member, add its letter to the row in `public-api.md`.
- Mark entries found by reading source, not running the host, as such.

## Releasing

Releases are manual and deliberate — no auto-publish on merge to `main`.

1. Changesets accumulate in `.changeset/` as PRs land (`pnpm run changeset`).
2. Run the `Manual: release and publish packages (changesets)` GitHub Actions workflow, or
   `gh workflow run release.yml -f branch=main` (`-f dry_run=true` to preview).
3. On success, `deploy-site.yml` auto-deploys the Astro docs site (chained via `workflow_run`); a
   failed release does not deploy. Manual redeploy: `gh workflow run deploy-site.yml`. Storybook
   is no longer published; it is a local dev tool (`pnpm run storybook`).

### Prereleases from `next` (`@next` on npm)

`next` releases through the same workflow, in changesets pre-release mode. Versions look like
`10.0.0-next.3` and publish under the `next` dist-tag, so `npm i @citolab/qti-components` still gets
the last stable release and `npm i @citolab/qti-components@next` gets the prerelease.

1. Once, on `next` (through a PR into `next`): `pnpm exec changeset pre enter next`, which commits
   `.changeset/pre.json`. This needs this release tooling merged into `next` first.
2. Each prerelease: `gh workflow run release.yml -f branch=next -f dry_run=true`, then the same
   without `dry_run`. The GitHub release is marked as a prerelease and the docs site is not deployed.
3. Shipping the major: `pnpm exec changeset pre exit` on `next`, merge `next` into `main`, release
   from `main`.

The workflow refuses a mismatch (`tools/changesets/check-release-lane.mjs`): a branch other than
`main` without `pre.json` would publish stable versions to `latest`, and `main` with `pre.json`
would publish a prerelease. The publish step reads the dist-tag from `.changeset/pre.json`.

`changeset publish` is intentionally not used (crashes on this workspace's pnpm registry
responses); `pnpm run ci:publish` runs `pnpm -r publish`, which only publishes versions not already
on npm and is safe to re-run.

## Committed generated files

`public/mockServiceWorker.js` is written by msw's postinstall in msw's own style and committed
byte-for-byte — `.prettierignore` excludes it. Never hand-format it; a diff there just means the
msw version moved.
