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
  - `qti-extended` — the test plugins: navigation links, stamp, scoring, print and view
    helpers, lock, bookmark, text-to-speech, zoom, character sheet. Published on its own, with the umbrella
    as a peer dependency; never re-exported from the umbrella or `/corrections`.
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

## Docs demos

- A story that only shows an example demo (a docs page, the Implementation section) uses the Getting started
  demo: the test `GETTING_STARTED_TEST` (`packages/qti-test/src/components/qti-test/getting-started.fixtures.ts`,
  two-column items) in the same markup as the `Getting started` story — `test-navigation` with a fixed-height
  `test-container` and a Previous/Next `nav`. Add only what the page is about around it.
- A docs page is a single sidebar entry: an `.mdx` in `docs/` with `<Meta of={…}>`, and its stories file
  under the same title tagged `!dev` (see `build-a-player`, `state`). No separate story in the sidebar.

## Fixtures

Files a story or spec loads live with their single user when there is one, and centrally only when
several places share them.

- **Images and other single files**: import them in the story (`import sign from './fixtures/sign.png'`).
  Vite handles them in dev and build; nothing to configure.
- **Files that link to each other** (an item and its images, a test and its items, a custom or
  portable interaction's scripts): a `fixtures/` folder next to the story, under the package's `src/`.
  Storybook serves every such folder at its repo path under `/fixtures/` (`colocatedFixtures` in
  `.storybook/main.ts`), so `packages/x/src/fixtures/` is `/fixtures/packages/x/src/fixtures/`. A new
  folder needs a Storybook restart.
- **Shared fixtures** (a demo test, the 1EdTech conformance suite, packages several stories or the
  docs site use) stay in `public/assets/`.
- Code reaches a fixtures folder or shared test through a constant in a `*.fixtures.ts` next to its user
  (see `getting-started.fixtures.ts`, `qti-custom-interaction.fixtures.ts`), never a typed path.
  `tools/testing/fixture-references.spec.ts` checks that every constant and every `.xml` reference
  points at a real file. Packages publish only `dist`, so fixtures never reach npm.

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
- **The backlog is `plans/ROADMAP.md`** for planned work, and GitHub issues for bugs and requests
  from outside. The roadmap orders the phases, says what each needs first and where each stands,
  and links a plan per phase. `plans/host-api.md` holds the decisions; a phase with research has its
  own plan, deleted when the phase ships. The PR that ships a phase updates the roadmap in the same
  commit. Read the roadmap before starting planned work.

### Choosing the lane

Ask: would this break an existing user of a published package (removed or renamed member, changed
behaviour, new required import)? No: `main`, milestone "9.x". Yes: `next`, milestone "Next major".
An issue that fits neither lane yet (docs, chores, ideas) stays without a milestone: unscheduled.
When unsure, put the issue in "Next major" and decide at triage.

### One change, start to finish

1. Open or pick an issue. Say which lane it is in.
2. Make a worktree off that lane's branch (`origin/main` or `origin/next`), named after the branch:
   branch `fix/foo` → `.claude/worktrees/fix-foo`. Unset the upstream after `-b … origin/<base>`.
3. Add a changeset if a published package changes (`pnpm run changeset`). On `next` it is a
   `major` when the change breaks, otherwise `minor`/`patch`.
4. Open the PR **into the same lane's branch**. The title is a conventional commit
   (`feat(test): …`); it becomes the squash commit.
5. CI must pass. On `main`, a review is required. Squash-merge. A change that is only docs, plans,
   changesets or workflows CI cannot test skips the heavy CI jobs, on the PR and on the push after
   the merge; the pre-commit hook skips VRT and the tests for it too.
6. Remove the worktree and the local branch; delete the remote branch after merge.

Always name the branch, the worktree and the PR number together when talking about any one of them.

### Releasing

- **`main`:** manual, as in "Releasing" below.
- **Every push to `main` is merged into `next` automatically** (`.github/workflows/sync-main-into-next.yml`,
  logic in `tools/ci/sync-main-into-next.sh`): a merge commit, pushed straight to `next`. On a
  conflict it pushes nothing and opens a PR `main` → `next`; resolve it and **merge it with a merge
  commit, never squash**, or the same changes conflict again. The release's version commit is the
  likeliest conflict (package versions, `CHANGELOG.md`).
- **`next`:** prereleases publish as `@next` on npm so hosts can install and test them; see
  "Prereleases from `next`" under Releasing below. `next` is in changesets pre mode
  (`.changeset/pre.json`); the release workflow refuses to release from a branch that is not.
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

`plans/host-api.md` is the host API: what implementing parties may use, change and rely on, and
every decision about it. `plans/host-migration/{kennisnet,citotestuit,peilinglezen,examenkompas}.md`
say what each host uses and must do. In the same commit as the change:

- A change that touches a member in `host-api.md` adds or updates the entries for every host that
  uses it, and its changeset links to them.
- When a change gives hosts a better or simpler way to do something (a new member replacing a
  workaround), write it into the affected hosts' files as a `recommended` entry, naming the
  workaround it replaces.
- When a survey shows a host using a member, write it into that host's file.
- Mark entries found by reading source, not running the host, as such.

## Releasing

Releases from `main` are manual and deliberate — no auto-publish on merge to `main`. `next` is the
exception: it publishes a `@next` prerelease by itself (see "Prereleases from `next`").

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
2. Each prerelease is automatic: when CI succeeds on a push to `next`, `release.yml` runs (via
   `workflow_run`, so it lives on `main`) and publishes whatever changesets are pending. A push
   without a changeset releases nothing. The release commit is `[skip ci]`, so it starts no CI run and
   no second release. To run one by hand: `gh workflow run release.yml -f branch=next -f dry_run=true`,
   then the same without `dry_run`. The GitHub release is marked as a prerelease and the docs site is
   not deployed.
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
