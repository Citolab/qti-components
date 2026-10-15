# Storybook table of contents (and docs split)

## Context
Storybook has 143 story files under 10+ unrelated prefixes (`Docs`, `E2E`, `Base`, `QTI Elements`, `QTI Interactions`, `Item`, `QTI Processing`, `Test`, `Theme`) plus stray titles (`Meerkeuzevraag`, `Test title 2`, `Stories/shuffle`, `Qti Test`, `TTS: no lang`, ~17× `QTI Kennisnet/Regression`, `qti-conformance/...`). Most are tests, not things a person reads. Goal: a sidebar that answers "what can I do" for a human, with tests moved out, and a subset publishable as a docs Storybook.

## Split of responsibility
| Surface | Audience | Content |
| --- | --- | --- |
| Astro site | integrator who has QTI XML | Markup only: build a `qti-test`, items, TTS, info items, item links; a handful of CSS variables; events out / state back in; maybe `configurationContext`. No JS API. |
| Storybook (published docs build) | developer extending or hosting | Full public API, extending interactions (can / cannot), qti-test plugins, per-component demos, cookbook. |
| Storybook (dev only) | us | Conformance, regression, VRT, diagnostics. |
| Spec files (`*.spec.ts`, `tests` project) | CI | Everything that has no visual value. |

## Proposed sidebar (top level, in this order)
```
1  Introduction            (mdx, one page: what is where, link to Astro site)
2  Concepts                (mdx: item vs test, host/state flow — short)
3  QTI Test                ← hero section, most-read
     Overview              (qti-test, minimal full test)
     Navigation            (linear, nonlinear, sequencing, adaptive)
     Scoring & outcomes
     Persist & restore
     Plugins               (creating plugins for qti-test; existing plugin stories)
     Building blocks       (test-container, test-next/prev, test-item-link, section links, stamps, view toggle, paging buttons)
4  QTI Item                (qti-item, item-container, print variables, feedback, modal feedback)
5  Interactions            (one folder per interaction, NUMBERING DROPPED; sorted alphabetically)
     Choice
       Overview            (the single autodocs story; only file with getStorybookHelpers)
       Examples            (a few variants: cardinality, orientation, shuffle, vocabulary)
     …Text Entry, Extended Text, Match, Order, Gap Match, Hotspot, …
6  Extending QTI          (three topics, in this order)
     Creating an extended interaction   (subclass Interaction; extend a built-in via class="type:…" + transformer)
     Creating a plugin                  (guide + requests; the built-in plugins stay under QTI Test/Plugins as reference)
     Public API                         (what extenders may depend on; links to API Reference)
7  Theming                 (CSS variables contract, themes, parts/states; replaces `Theme`, `css-contract`)
8  API Reference           (public-api.mdx, custom-elements, Host API, Extension API, configuration context, events, ElementInternals/a11y state)
9  Cookbook                (how the implementation projects use it — one story per host scenario)
     Kennisnet             (formative correction, retry, show answer)
     CitoTestUit           (fullscreen wrapper, persist/restore, scoring)
     PeilingLezen          (extended interactions, custom interaction)
     TTS                   (lang variants: element/item/none)
10 Testing  [dev only, tag `!docs`]
     Conformance           (current `qti-conformance/*`)
     Regression            (item001–017, VRT; was `QTI Kennisnet/Regression`)
     Diagnostics           (layout invariance)
11 Maintainers (publishing.mdx, hi-qti)
```
Rules behind it:
- Sort by task, not by package. Package structure (`Base`, `QTI Processing`, `QTI Elements`) disappears from navigation.
- Exactly one story per interaction is the "Overview"; scenario stories (a11y, api, forms, validation, behavior, config) leave the sidebar. Keep the file taxonomy from `AGENTS.md`, but they get `tags: ['!dev','!autodocs']`-style hiding or become `.spec.ts`.
- Names are English, no numeric prefixes, no brand names outside Cookbook.

## What becomes a spec instead of a story
Candidates (no one needs to look at them): `qti-base/Context root`, `qti-outcome-condition`, `*.validation`, `*.forms`, `*.dom`, `*.api`, `*.a11y` scenario stories, `Stories/shuffle`, `Test title`/`Test title 2`, `qti-elements/*Feedback*` plumbing, `qti-assessment-item-ref`, `qti-assessment-stimulus-ref`, `qti-stylesheet`. Behaviour moves to `*.spec.ts` (plain `tests` project) or browser tests; anything with a11y/visual value stays in Testing.

## Docs build
- Tag-driven: stories tagged `dev` or `test` are excluded from the published build via `tags.exclude` (`storybook build --test`-style or a `STORYBOOK_DOCS=1` env in `.storybook/main.ts`, same pattern as the existing `VRT=1` branch).
- Replace the 9 `titlePrefix` globs in `.storybook/main.ts` with explicit `title:` per file (autotitle) so the tree above is stable; set `storySort` in `.storybook/preview.ts` with the top-level order above.
- Play functions: separate follow-up (disable auto-run via a global `parameters.test`/`tags` toggle; run only in `test-runner`/vitest). The TOC doesn't depend on it.

## Open decisions for you
1. Does Kennisnet/CitoTestUit/PeilingLezen material belong in the public Cookbook, or in dev-only Testing? (affects the docs build)
2. Keep `Concepts` as its own page, or fold into Introduction?
3. Conformance + 17 regression stories: stay as stories (VRT needs them) in a hidden `Testing` branch — OK?

## Verification (when implemented)
- `pnpm run storybook` and walk the tree top to bottom; no orphan titles.
- `pnpm run test` (stories + tests projects) and `pnpm run test:vrt` must still pass — VRT globs `apps/e2e/src/**/kennisnet.stories.ts` and the titlePrefix `E2E`; changing that title breaks baseline names, so re-title must keep baseline filenames or regenerate them deliberately.
- Build the docs-only Storybook and confirm `Testing` is absent.
- Not yet done: counting which stories have play functions (103 files do) and which of them assert only — needed before the spec migration.

## Next steps (separate plans)
1. Astro trim (remove JS/API pages; keep markup + CSS variables + events/state).
2. Story → spec migration list.
3. Play-function opt-in.
