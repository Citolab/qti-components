# CLAUDE.md

The one instruction file for this repository. Topic rules load by path from `.claude/rules/`; the
procedures are skills in `.claude/skills/`. When code and a rule disagree, fix one of them in the
same change.

<!-- Maintainers: keep this file under 200 lines. Anything that applies only to some paths goes in
.claude/rules/<topic>.md with a `paths:` frontmatter. tools/testing/guidance-references.spec.ts
(roadmap G2) checks that every path and script named here exists. -->

## What this is

`@citolab/qti-components` is a Lit web component library that renders 1EdTech QTI 3 assessment
items and tests. A pnpm monorepo; the umbrella `packages/qti-components` re-exports the core
packages for hosts that want one install.

## Commands

| Command                    | What it does                                                        |
| -------------------------- | ------------------------------------------------------------------- |
| `pnpm install`             | install deps (msw postinstall writes `public/mockServiceWorker.js`) |
| `pnpm run storybook`       | Storybook + CEM watch, port 6006 (the lab; not published)           |
| `pnpm run docs`            | the Astro docs site (`apps/site`)                                   |
| `pnpm run test`            | cleans build state, then `vitest run` (projects `stories`, `tests`) |
| `pnpm run test:vrt`        | visual regression, `VRT=1`: the kennisnet stories only              |
| `pnpm run test:vrt:update` | re-bless VRT baselines (check every PNG before staging it)          |
| `pnpm run tsc`             | typecheck, no emit                                                  |
| `pnpm run lint`            | CEM regen + eslint + stylelint                                      |
| `pnpm run build`           | build all packages                                                  |
| `pnpm run changeset`       | describe a version bump                                             |
| `pnpm run ci:push-quality` | lint → madge → build → test → publint → attw → consumer-types       |

One test: `pnpm exec vitest run --project tests <path>` or `--project stories -t "<name>"`.
Vitest projects (`vitest.config.ts`): `stories` runs every story's play function in Chromium,
`tests` runs `*.spec.ts`/`*.test.ts`, `vrt` exists only with `VRT=1`, `legacy` only with `LEGACY=1`.

## Repo map

- `packages/*`, one package per concern:
  - `qti-base` shared base classes; `qti-utilities` generic helpers with no QTI meaning.
  - `qti-elements` QTI non-interaction elements; `interactions/*` one package per interaction,
    `packages/interactions/core` the shared mixins; `qti-interactions` only re-registers them.
  - `qti-item`, `qti-test` the host elements; `qti-processing` response and outcome processing;
    `qti-loader` loading; `qti-transformers` content transforms.
  - `qti-corrections` correction overlays; `qti-extended` the test plugins (bookmark, lock, stamp,
    zoom, tts, print, scoring…), published alone with the umbrella as peer, never re-exported.
  - `qti-theme` all semantic CSS; `CONTRACT.md` there is the styling reference.
- `apps/e2e` host-shaped tests, conformance, regression and cookbook stories; `apps/site` the Astro
  (Starlight) docs site; `docs/` Storybook docs pages (moving to the site, roadmap phase 16).
- `tools/` build, lint and test tooling; `.storybook/` Storybook config; `cem.config.mjs` the
  custom-elements manifest that docs and checks read.

## Which document owns what

| Question                                         | Owner                                                  |
| ------------------------------------------------ | ------------------------------------------------------ |
| What hosts may use, every API decision           | `plans/host-api.md`                                    |
| What each host uses and must change              | `plans/host-migration/*.md`                            |
| What is built when, what is decided before it    | `plans/ROADMAP.md` and the roadmaps it lists           |
| Layers, parts, states, tokens, overrides         | `packages/qti-theme/CONTRACT.md`                       |
| Lit, stories, tests, QTI, theme, docs, releasing | `.claude/rules/*.md` (load when you touch those paths) |

Read the matching rule before writing code in an area, even if it has not loaded yet:
`lit`, `interactions`, `stories`, `tests`, `qti-spec`, `theme`, `plugins`, `host-api`, `docs`,
`releasing`.

## Rules everywhere

- **QTI decides.** The XSD for structure, then the QTI 3 spec text for behaviour, then the 1EdTech
  conformance suite. When two disagree, present the evidence and ask; never pick a deviation or add
  a non-QTI switch to keep old behaviour. QTI 3 only. See `.claude/rules/qti-spec.md`.
- **`qti-` belongs to 1EdTech.** Everything that is ours is `qc-`: tokens (`--qc-*`), events
  (`qc-*`), attributes, and our elements (roadmap phase 14), except the host elements `qti-test`
  and `qti-item`, which keep their names. `cito-*` names are one-major aliases.
- **Single instances.** `lit`, `lit-html`, `@lit/context`, `@heximal/templates` and `storybook` are
  pinned once in `pnpm-workspace.yaml`'s `catalog:` and referenced as `"catalog:"`; never a literal
  range. A split loads Lit twice and silently breaks `instanceof` and context. Pack and publish only
  through pnpm (`npm pack` does not rewrite `catalog:`).
- **Package boundaries.** No relative imports across packages; reuse existing helpers before adding
  one. `#private` fields, no underscore prefixes.
- **Generated files.** `public/mockServiceWorker.js` is msw's, byte for byte; never edit it.
  `CHANGELOG.md` is written by changesets; edit it only to resolve a main → next sync conflict.
- **Fixtures** live with their single user, centrally (`public/assets/`) only when shared:
  - a single file (an image): import it in the story; Vite handles it.
  - files that link to each other (an item and its images, a test and its items, PCI scripts): a
    `fixtures/` folder next to the story under the package's `src/`. Storybook serves it at its repo
    path under `/fixtures/` (`colocatedFixtures` in `.storybook/main.ts`); a new folder needs a
    Storybook restart.
  - code reaches a fixture folder or shared test through a constant in a `*.fixtures.ts`, never a
    typed path (`tools/testing/fixture-references.spec.ts`). Packages publish only `dist`.

## Working agreement

Two lanes, one backlog.

- **`main`** is the current major, always releasable: fixes and non-breaking features, milestone
  "9.x". **`next`** is the next major: breaking and architectural changes, milestone "Next major".
  Would it break an existing user of a published package (removed or renamed member, changed
  behaviour, new required import)? Then `next`. Unsure: "Next major", decided at triage.
- **The backlog** is `plans/ROADMAP.md` (the roadmaps, in order) for planned work; GitHub issues only for bugs and outside
  requests. Read the roadmap before planned work. The PR that ships a phase ticks it in the same
  commit.
- Every push to `main` is merged into `next` automatically
  (`.github/workflows/sync-main-into-next.yml`). On a conflict it opens a PR `main` → `next`: resolve
  it and merge with a merge commit, never squash.

### One change, start to finish

Skills: `/start-change` and `/finish-change`.

1. Pick the roadmap phase or issue; say which lane.
2. A worktree off that lane: branch `fix/foo` → `.claude/worktrees/fix-foo`, from `origin/<lane>`,
   upstream unset. Never switch branches in the root checkout.
3. The change, with its definition of done (below).
4. A PR into the same lane. The title is a conventional commit (`feat(test): …`), the squash commit.
5. CI green, then squash-merge. `main` needs a review; `next` has no required checks, so watch
   `gh pr checks <n> --watch --fail-fast` before merging.
6. Remove the worktree and local branch; delete the remote branch after merge.

Name the branch, the worktree and the PR number together when talking about any one of them.

### Definition of done

- A test that fails without the change (a bug fix always starts there); see `.claude/rules/tests.md`.
- A changeset when a published package changes; on `next`, `major` when it breaks.
- A member in `host-api.md` touched: host-migration entries for every host using it, linked from
  the changeset, and its site page and JSDoc updated in the same PR.
- A renamed or moved story moves its VRT baseline; a re-blessed PNG is checked, not trusted.
- A roadmap phase: its status and steps ticked in the same commit.
- `pnpm run lint` and the affected tests pass locally.

### Rules that bind Claude

- The user reviews every commit before it is made: show the files, the diff and the message, then
  wait. Approval for one commit does not carry over to the next; "do what you think is best" is
  not approval.
- Ask before what others see: push, PR, merge, remote branch deletion, workflow run and release.
  Routine local git (worktrees, staging, deleting a merged or empty local branch) needs no ask.
  `.claude/settings.json` enforces the asks and denies.
- Never `--admin`, never force-push, never push to `main` or `next` directly.
- No destructive git (`reset --hard`, `clean`, `checkout -- .`, `branch -D`, removing a worktree
  with changes) unless asked. Never revert changes you did not make; other sessions work in this
  repo in parallel. When unexpected modifications appear, stop and ask.
- When reporting back: what changed and why, file references, which checks ran and which did not,
  and known gaps.
- Work in a worktree; `.claude/hooks/guard-git.mjs` refuses commits in the root checkout on a lane
  branch.
- Before a new check, hook or CI job: heavy verification (madge, attw, publint, the full suite)
  belongs in CI, not in the pre-commit hook.
