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

## Open questions

- Which components are plugins? (Candidates above; the owner decides.)
- Does a plugin ever need to *write* to the test (e.g. scoring buttons set outcomes)? Today the
  contexts are read-only for plugins except the navigation request. A write path is the main
  design risk.
- One package per plugin, or folders inside `@qti-components/test`? Folders keep one install and
  one version; packages allow independent versions but multiply the release plumbing.
- Does `register.ts` side-effect registration stay, given scoped registries elsewhere
  (`qti-corrections`)?

## Not in this branch

- Any change to `main`; behaviour fixes go there and are merged into `next`.
- The Kennisnet 9.x migration material already here (`plans/host-migration/`): it belongs to the
  hosts, not to the plugin API.
