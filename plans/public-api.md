# Public API: what hosts use, and what we support

## Goal

Decide the public API from what third-party hosts actually use, not from what happens to be
reachable. The rule we adopt: **what is documented on the Astro site is public; everything else
may change in a minor.** This file is the inventory that page is written from.

Related: `plans/reactive-state.md` (phases), PR #225 (`qtiTest.state` + `qti-state-changed`),
PR #226 (restored template values), `plans/css-contract-audit.md` (styling tier).

## Sources

Read-only survey of `/Users/patrickklein/Projects/PrototypesQTI`, 2026-10-05.

| Host                                              | Library                                                                                                                                                                    | Surveyed                                                                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Kennisnet** (Angular)                           | `@kennisnet/qti-components` 7.28.1, most likely a republish of ours under Kennisnet's own name (same licence and runtime deps, no dependency on `@citolab/qti-components`) | in depth: `projects/shared/src/lib/{qti,player}`, `projects/player`                                                         |
| **CitoTestUit** (React)                           | `@citolab/qti-components` 9.3.0 (vendored tgz)                                                                                                                             | in depth: `frontend/packages/ui/src/assessment-player`, student store, admin review stats                                   |
| PeilingLezen                                      | 7.1–7.14                                                                                                                                                                   | imports only: deep `/exports/*` imports, ~17 custom interactions on `Interaction`, consumes `testContext`/`computedContext` |
| QTI-Playground, QTI-Express, qti-player           | 7.27 / yalc / 9.3                                                                                                                                                          | imports only                                                                                                                |
| kringloop, Replay, Toetsen in context, wat-is-het | 2.x–6.x                                                                                                                                                                    | not surveyed                                                                                                                |

Paths below are relative to each host repo.

## How the two main hosts persist state

|                          | Kennisnet                                                                                                                                                              | CitoTestUit                                                                                                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stores                   | whole `TestContext` + own fields (`currentItemId`, `maxIndex`, `submitted`, `manualScores`) — `player/model/state.ts`                                                  | whole `TestContext` + `navItemId` + bookmarks as `marked` on context items (`ExtendedTestContext`, `@citolab/qti-api`) — `assessmentStore.ts:342-372`                                                 |
| Saves on                 | `qti-test-context-updated`, debounced 500 ms, PUT to backend — `store/events.ts:85-99`, `actions/persist.ts`                                                           | `qti-test-context-updated`, debounced 500 ms, awaited flush at hand-in — `AssessmentPlayerView.tsx:663-725`                                                                                           |
| Restores                 | `qtiTest.testContext = saved` (cast) on `qti-assessment-test-connected`, then `navigateTo` — `store/events.ts:117-148`                                                 | `qtiTest.testContext = {...saved}` once, guarded, then `navigateTo(navItemId)` once — `AssessmentPlayerView.tsx:1495-1530`                                                                            |
| Seed                     | none                                                                                                                                                                   | per-session seed from backend, `asSeed`, written to `test-navigation.qtiContext.QTI_CONTEXT.seed` — `AssessmentPlayerView.tsx:1481-1490`                                                              |
| Workarounds for our bugs | assigning `testContext` emits nothing, so it rebuilds its store by hand (`mutators.ts:128-161`); `updateItemVariables` "doesn't fire reliably" (`check-item.ts:34-38`) | event payload is stale, "can predate the response", so it reads `qtiTest.testContext` live (`AssessmentPlayerView.tsx:641-661`); a late restore overwrote newer answers, hence a guard (`:1495-1510`) |

`state` + `qti-state-changed` (PR #225) replace both flows. The emitted state is built in
`updated()`, so it cannot be stale. `state` can be assigned before load. The
`updateItemVariables` fix is in the same PR.

## Inventory and proposed status

Hosts: **K** Kennisnet, **C** CitoTestUit, **P** PeilingLezen; `—` means none of them, and a
detail in parentheses says how. Add a letter when a survey finds a host using a member.

Status: **S** supported (document + contract story), **D** deprecated (keep until the next major),
**I** internal (may change, not documented).

### Host tier: embedding a test

| Member                                                                                                                   | Hosts | Status           | Notes                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------ | ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `qtiTest.state`, `qti-state-changed`                                                                                     | —     | **S**            | new; the persistence contract                                                                                                                                                                                                  |
| `qti-test-context-updated`                                                                                               | K, C  | **D**            | both depend on it; keep until both migrate                                                                                                                                                                                     |
| assigning `qtiTest.testContext`                                                                                          | K, C  | **D** for hosts  | still the context provider internally                                                                                                                                                                                          |
| `navigateTo(type, id)`                                                                                                   | K, C  | **S**            |                                                                                                                                                                                                                                |
| `navigate="item" \| "section"`                                                                                           | K, C  | **S**            |                                                                                                                                                                                                                                |
| `qti-request-navigation` (host dispatches)                                                                               | K, C  | **S** or replace | both use it as a fallback for `navigateTo`                                                                                                                                                                                     |
| `configContext`                                                                                                          | K, C  | **S**            | document the options in use: `disableAfterIfMaxChoicesReached`, `correctResponseMode`, `inlineChoicePrompt`, `fullCorrectResponseOnlyWhenIncorrect`, `reportValidityAfterScoring`, `validationDisplayMode`, info-item category |
| `qtiTest.qtiContext` (seed)                                                                                              | C     | **S**            | provided by `qti-test` since Phase 3; CitoTestUit should move its prop here (see `host-migration/citotestuit.md`)                                                                                                              |
| `test-navigation.qtiContext`                                                                                             | C     | **D** alias      | reads and writes `qtiTest.qtiContext`; removed in the next major                                                                                                                                                               |
| `asSeed`, `QtiContext`                                                                                                   | C     | **S**            |                                                                                                                                                                                                                                |
| `updateItemVariables`                                                                                                    | K     | **S**            | external scoring; fixed in #225                                                                                                                                                                                                |
| `test-container` `testURL` / `test-url`                                                                                  | K, C  | **S**            |                                                                                                                                                                                                                                |
| `test-navigation` `auto-score-items`, `initContext`                                                                      | K, C  | **S**            | document. `cache-transform` no longer exists in the library; Kennisnet and the Playground still set it, which does nothing                                                                                                     |
| `qti-assessment-test-connected`, `qti-assessment-item-connected`, `qti-assessment-item-ref-connected`, `qti-test-loaded` | K, C  | **S**            | lifecycle                                                                                                                                                                                                                      |
| `qti-interaction-changed`                                                                                                | K, C  | **S**            | CitoTestUit logs it for interaction replay                                                                                                                                                                                     |
| `qti-outcome-changed`                                                                                                    | K     | **S**            |                                                                                                                                                                                                                                |
| `qti-rubric:discretionary-placement`                                                                                     | K     | **S**            |                                                                                                                                                                                                                                |
| `on-test-switch-view` (host dispatches)                                                                                  | K     | **S** → replace  | becomes a `view` property; event stays as a deprecated path                                                                                                                                                                    |
| `test-show-candidate-correction` (host dispatches)                                                                       | K     | **S** → replace  | becomes a method on `qti-test`                                                                                                                                                                                                 |

### Item tier: external scoring and review

| Member                                      | Hosts             | Status | Notes                                                                                                                                                  |
| ------------------------------------------- | ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `item.setOutcomeVariable`                   | K                 | **S**  | re-applies stored outcomes so modal feedback shows                                                                                                     |
| `item.processResponse(countAttempts?)`      | K                 | **S**  |                                                                                                                                                        |
| `item.showCandidateCorrection(show)`        | K                 | **S**  | not on `qti-assessment-item`: it is on `qti-assessment-item-correction` (`@qti-components/corrections`), so no story in the elements package covers it |
| `item.disabled`                             | K                 | **S**  | locks a submitted item                                                                                                                                 |
| `item.assessmentItemRefId`                  | K                 | **S**  | item-ref id differs from the item's own id                                                                                                             |
| `item.variables` / `item.responses` setters | C                 | **S**  | review screen shows a student's answers                                                                                                                |
| `item.resetInteractions`                    | C (optional call) | gone   | no longer exists; host already guards with `?.`                                                                                                        |

### Extension tier: replacing or adding components

| Member                                        | Hosts             | Status                                                                                                                                                  |
| --------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `postLoadTransformCallback`                   | K, C              | **S**                                                                                                                                                   |
| `transformer.extendElementName(tag, suffix)`  | K                 | **S**                                                                                                                                                   |
| `postLoadTestTransformCallback`               | C                 | **S**                                                                                                                                                   |
| `<template item-ref>` on `qti-test`           | C                 | **S**                                                                                                                                                   |
| subclass `QtiFeedback`                        | K                 | **S** base class                                                                                                                                        |
| subclass `Qti*InteractionCorrection`          | C                 | **S** base class                                                                                                                                        |
| subclass `Interaction`                        | P (~17)           | **S** base class; needs a proper entry point                                                                                                            |
| consume `testContext` / `computedContext`     | P                 | **S** for component authors; needs a proper entry point instead of `/exports/*.context.js`. `ComputedItem.valid` is published by the item since PR #231 |
| deep imports (`/exports/*`, `/cdn/exports/*`) | P (+ QTI-Express) | **I**; offer documented entry points                                                                                                                    |

### Styling tier: currently missing

| What hosts do today                                                                    | Hosts                                                     | Status                                            |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| inject a stylesheet into `test-container.shadowRoot`                                   | K (`player.ts:189-226`)                                   | **I**; need a supported way to theme              |
| patch interaction shadow DOM (icons, info text), MutationObservers on our shadow roots | K (`qti/item/*.ts`), C (deep query, 39 `shadowRoot` uses) | **I**                                             |
| read `internals.states` / set `internals.ariaChecked`                                  | K (`draggables.ts:65`), C (stats)                         | **I**                                             |
| internal class names `.full-correct-response`, `span.correct-option`, `part~="point"`  | K                                                         | **I** unless promoted to `::part` / custom states |

## Decisions and gaps

1. **State contract.** `QtiTestState` is right for both hosts. Neither needs config, view or
   declarations in it. Both keep their own extra fields next to it (pages, frontier, manual
   scores), and that is fine: the host stores `state` alongside its own data.
2. **`href` stays out of the state.** Kennisnet reads it per item to call its scoring backend
   (`check-item.ts:48`). It is test structure; read it from `qti-assessment-item-ref`. Mention it
   in the migration note.
3. **Bookmarks go into `state.session.bookmarks`.** CitoTestUit stores them as `marked` on context
   items today; the `feat/test-item-bookmark` branch replaces that. PeilingLezen is a candidate
   first user, together with highlights.
4. **Highlights need anchors that survive a reload** (item identifier + text position). Design
   that before building.
5. **Phase 3 keeps `test-navigation.qtiContext` as a deprecated alias** of `qtiTest.qtiContext`. CitoTestUit sets the seed there today.
6. **Events hosts dispatch into us** (`on-test-switch-view`, `test-show-candidate-correction`)
   become a `view` property and a `showCandidateCorrection` method. The events stay as a
   deprecated path.
7. **The styling tier is the biggest gap.** Both hosts patch our shadow DOM. Offer `::part`,
   CSS custom states and a theming hook so they can stop. `plans/css-contract-audit.md` already
   proposes element names, custom states and parts as the styling contract; check the patches
   above against it.
8. **`qti-test-context-updated` stays (deprecated)** until both main hosts are on `state`.

## Next steps

- [x] Astro "Public API" page from the tables above: one section per tier, a status per member.
- [x] A contract story per supported host-tier and item-tier member, like `qti-test.api.stories.ts`. Left: `showCandidateCorrection` (corrections package), `test-container` `test-url`, `auto-score-items`, `qti-outcome-changed`, `qti-rubric:discretionary-placement`, `on-test-switch-view`, `test-show-candidate-correction`, the extension tier.
- [x] Migration note for Kennisnet and CitoTestUit (see `plans/host-migration/`): `testContext` → `state`, `href` from the
      item-ref, bookmarks → `state.session`.
- [ ] Bookmarks and highlights in `state.session` on `feat/test-item-bookmark`, with an anchor
      design for highlights.
- [ ] Proper entry points for `Interaction` and the contexts, replacing `/exports/*` imports.
- [ ] Styling tier: map what Kennisnet and CitoTestUit patch onto `plans/css-contract-audit.md`,
      then decide parts and states.
- [ ] Optional: survey PeilingLezen in depth, and the 2.x–6.x hosts if their usage still matters.
