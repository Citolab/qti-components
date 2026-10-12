# Test plugin architecture (branch `feat/test-plugin-architecture`, PR #261, target `next`)

Working notes, written 2026-10-12 before the work starts. Not a backlog: concrete tasks become GitHub
issues. This file keeps the reasoning that would otherwise be lost. Delete it when the architecture
ships and the Storybook guide "Guides → Test plugins" says everything that matters.

## Goal

Every optional piece of `qti-test` is a **plugin**: a folder that uses only public API, that the
core does not refer to, and that a host opts into with one import. The API is clean (small,
named, versioned by changesets) and documented (the Storybook guide plus the Public API page).

Text-to-speech (`packages/qti-test/src/tts/`) is the first plugin and the reference implementation.

## What exists

- Entry points per plugin: `@qti-components/test/tts` (registers), `…/tts/elements` (classes only),
  umbrella `@citolab/qti-components/tts`.
- A plugin reads one context, `computedContext`, plus the navigation request. New member
  `computedContext.itemElement(identifier)` (a function, so `JSON.stringify` skips it).
- `plugin-boundary.spec.ts` fails on any reference to the plugin from outside its folder and on any
  import of test internals.
- Step A (compatibility): the core still registers and re-exports TTS, on lines marked
  `tts-plugin: Step-A compatibility`. Step B (this branch, `next`): remove those lines. That is the
  breaking change and the changeset becomes a major.

## Ideas, in the order I would do them

1. **Survey before designing.** For each optional component in `packages/qti-test/src/components/`,
   list what it consumes: which contexts, which `test-container` / `test-navigation` internals,
   which events it listens to or dispatches, whether anything in the core imports it. The survey is
   what shows what the plugin API must cover; `itemElement` came out of doing it for TTS only.
2. **Candidates** (my reading of the component list, not verified): `test-print-context`,
   `test-print-item-variables`, `test-scoring-buttons`, `test-scoring-feedback`, `test-view`,
   `test-view-toggle`, `test-check-item`, `qti-test-feedback`, the two `*-buttons-stamp` elements.
   Core, not plugins: `qti-test`, `test-navigation`, `test-container`, and the QTI spec elements
   (`qti-assessment-*`, `qti-outcome-processing`, `qti-test-part`, `qti-test-variables`, …).
3. **One boundary spec for all plugins**, not one per folder: a list of plugin folders, each with
   the same two rules. Adding a plugin then means adding a line.
4. **A plugin convention, written down once**: folder layout (`index.ts`, `elements.ts`,
   `register.ts`), the three entry points, the package.json export entries, how the umbrella
   re-exports it. Today this is only visible by reading `tts/`.
5. **Decide what is public.** Everything a plugin may import becomes a documented member of
   `plans/public-api.md` (extension tier). Everything else is internal and the boundary spec keeps
   plugins off it. Prefer widening a context over exposing an element.
6. **Naming.** `plans/public-api.md` decided `cito-` for new public events (renames come later).
   `qti-` belongs to 1EdTech, so plugin tags and events should not use it.
7. **Docs.** The Storybook guide has an example plugin with a story that tests the API it uses.
   Keep that story as the executable contract: if a plugin API member changes, that story fails.
8. **Host check.** No surveyed host uses TTS, so Step B is low risk for TTS. For other plugins, check
   `plans/public-api.md` for host letters (K, C, P) before moving anything; a plugin that a host
   uses needs a `plans/host-migration/` entry in the same commit.

## Survey results (2026-10-12)

Done against `next` after the sync, for the components in `packages/qti-test/src/components/`.

**Most optional components are already plugin-shaped.** They read only `computedContext` (or
`sessionContext`) and talk to the test through events. Nothing in the core imports them except
`elements.ts` (registration) and `components/index.ts` (re-export), exactly as TTS was before it
moved. Splitting them out is mostly moving registration into plugin entry points.

| Component                                                                           | Reads                                         | Writes (events dispatched)                   | Verdict                                                                      |
| ----------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| `test-print-context`, `test-print-item-variables`, `test-scoring-feedback`          | `computedContext`                             | none                                         | plugin as is                                                                 |
| `test-scoring-buttons`                                                              | `computedContext`                             | `test-update-outcome-variable`               | plugin as is; the write path is that event                                   |
| `test-stamp`, `test-paging-buttons-stamp`, `test-section-buttons-stamp`             | `computedContext`                             | `qti-stamp-context-updated` (`test-stamp`)   | plugin as is                                                                 |
| `test-view-toggle`, `test-view`                                                     | `sessionContext`                              | `on-test-switch-view` (`detail` is the view) | plugin as is                                                                 |
| `qti-test-feedback`                                                                 | none                                          | none                                         | plugin as is (20 lines)                                                      |
| `test-check-item`                                                                   | internal `testHostContext`                    | `test-end-attempt`                           | **outlier**, see below                                                       |
| `test-next`, `test-prev`, `test-end-attempt`, `test-item-link`, `test-section-link` | `computedContext` or none                     | `qti-request-navigation`, `test-end-attempt` | navigation controls: keep in core, or one `navigation` plugin; owner decides |
| `qti-number-selected`, `qti-test-variables`                                         | `testContext` + `internal/item-ref-selection` | none                                         | QTI spec elements and internals: core                                        |

**The write path is already an API: four events.** `qti-request-navigation` (go to an item, section
or step), `test-end-attempt` (score the active item) and `test-update-outcome-variable`
(`{ assessmentItemRefId, outcomeVariableId, value }`, sets an outcome on an item) are handled by
`test-navigation`; `on-test-switch-view` (`detail` is the view) switches the view. A plugin never
needs a method on the test. These events, plus `computedContext` and `sessionContext`, are most of
what the plugin API has to document and pin.

**The one outlier: `test-check-item`.** It ends the attempt (an event, fine) and then reaches into
`test-container`'s shadow root through the internal `testHostContext` to add `.show` to every
`[view]` element. That is the same reaching TTS had to give up. It needs a public way to say "reveal
the view elements", most likely a change to the session `view` (which `test-view-toggle` already
drives) or a small event, not a DOM walk. This is the main design question left.

**Own `<template>` lookups are fine.** The `querySelector('template')` calls in the stamp and button
components read the element's own children, not the test's internals.

## Open questions

- Which components are plugins? The survey says every candidate except `test-check-item` already
  qualifies; the owner decides whether the navigation controls join them.
- How does `test-check-item` reveal `[view]` elements without reaching into `test-container`?
  (Change the session `view`, or a small event.)
- Write path: answered by the survey. The four events above are the API; they need contract stories
  and entries in `plans/public-api.md`.
- One package per plugin, or folders inside `@qti-components/test`? Folders keep one install and
  one version; packages allow independent versions but multiply the release plumbing.
- Does `register.ts` side-effect registration stay, given scoped registries elsewhere
  (`qti-corrections`)?

## Not in this branch

- Any change to `main`; behaviour fixes go there and are merged into `next`.
- The Kennisnet 9.x migration material already here (`plans/host-migration/`): it belongs to the
  hosts, not to the plugin API.
