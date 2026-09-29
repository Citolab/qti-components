# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@citolab/qti-components` is a web component library (built on Lit) that renders 1EdTech QTI
assessment items and tests. It's a pnpm monorepo; the umbrella `packages/qti-components` package
re-exports everything else for consumers who just want one install.

## Commands

| Command                     | What it does                                                          |
|------------------------------|-------------------------------------------------------------------------|
| `pnpm install`               | install deps (msw postinstall writes `public/mockServiceWorker.js`)    |
| `pnpm run storybook`         | dev server — Storybook + CEM watch, port 6006                          |
| `pnpm run test`              | full suite: cleans build state, then `vitest run`                     |
| `pnpm run test:vrt`          | visual regression tests (`VRT=1`, only stories tagged `vrt`)           |
| `pnpm run test:vrt:update`   | regenerate VRT baseline screenshots                                    |
| `pnpm run tsc`               | typecheck, no emit                                                     |
| `pnpm run lint`               | CEM regen + eslint + stylelint                                        |
| `pnpm run build`             | build all packages (`pnpm -r run build`)                              |
| `pnpm run changeset`         | describe a version bump (do this in your PR if it touches a package)  |
| `pnpm run ci:push-quality`   | full CI gate: lint → madge → build → test → publint → attw            |

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
  - `qti-interactions` — interaction components (choice, text-entry, hotspot, etc.) — canonical
    location; `packages/interactions/*` (per-interaction subpackages) is a legacy/parallel layout
    being migrated away from — both currently carry duplicate `AGENTS.md` rules.
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
  `tools/changesets/*`, `tools/publish-if-needed.mjs`).
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

Applies to `packages/qti-interactions/**` and `packages/interactions/**` (see their local
`AGENTS.md` for the full policy):

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

## Releasing

Releases are manual and deliberate — no auto-publish on merge to `main`.

1. Changesets accumulate in `.changeset/` as PRs land (`pnpm run changeset`).
2. Run the `Manual: release and publish packages (changesets)` GitHub Actions workflow, or
   `gh workflow run release.yml -f branch=main` (`-f dry_run=true` to preview).
3. On success, `deploy-sb.yml` auto-deploys the Storybook site (chained via `workflow_run`); a
   failed release does not deploy. Manual redeploy: `gh workflow run deploy-sb.yml`.

`changeset publish` is intentionally not used (crashes on this workspace's pnpm registry
responses); `pnpm run ci:publish:missing` runs `tools/publish-if-needed.mjs` instead, which only
publishes versions not already on npm and is safe to re-run.

## Committed generated files

`public/mockServiceWorker.js` is written by msw's postinstall in msw's own style and committed
byte-for-byte — `.prettierignore` excludes it. Never hand-format it; a diff there just means the
msw version moved.
