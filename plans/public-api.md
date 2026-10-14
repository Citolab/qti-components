# Public API: what hosts use, and what we support

## Goal

Decide the public API from what third-party hosts actually use, not from what happens to be
reachable. The rule we adopt: **what is documented on the Public API page (Storybook, `docs/public-api.mdx`) is public; everything else
may change in a minor.** This file is the inventory that page is written from.

Related: the reactive-state work (PRs #225 to #233; its plan is retired, the left-overs are issues #235 to #241), PR #225 (`qtiTest.state` + `qti-state-changed`),
PR #226 (restored template values), the styling-tier audit (retired; read it with `git show 614c666e:plans/css-contract-audit.md`, partly stale after the single-theme pivot).

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
| `cito-test-items-skipped`, `cito-test-end-reached`                                                                       | —     | **S**            | new (PR #289); linear sequencing: items passed over by a pre-condition or branch rule, and the end of the test                                                                                                                 |
| `configContext`                                                                                                          | K, C  | **S**            | document the options in use: `disableAfterIfMaxChoicesReached`, `correctResponseMode`, `inlineChoicePrompt`, `fullCorrectResponseOnlyWhenIncorrect`, `reportValidityAfterScoring`, `validationDisplayMode`, info-item category |
| `qtiTest.qtiContext` (seed)                                                                                              | C     | **S**            | provided by `qti-test` since Phase 3; CitoTestUit should move its prop here (see `host-migration/citotestuit.md`)                                                                                                              |
| `test-navigation.qtiContext`                                                                                             | C     | **D** alias      | reads and writes `qtiTest.qtiContext`; removed in the next major                                                                                                                                                               |
| `asSeed`, `QtiContext`                                                                                                   | C     | **S**            |                                                                                                                                                                                                                                |
| `updateItemVariables`                                                                                                    | K     | **S**            | external scoring; fixed in #225                                                                                                                                                                                                |
| `outcomeProcessing()`                                                                                                    | —     | **S**            | documented on Scoring & State; finds the test inside `test-container`'s shadow root, which it did not before Phase 4                                                                                                           |
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

| Member                                        | Hosts             | Status                                                                                                                                                       |
| --------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `postLoadTransformCallback`                   | K, C              | **S**                                                                                                                                                        |
| `transformer.extendElementName(tag, suffix)`  | K                 | **S**                                                                                                                                                        |
| `postLoadTestTransformCallback`               | C                 | **S**                                                                                                                                                        |
| `<template item-ref>` on `qti-test`           | C                 | **S**                                                                                                                                                        |
| subclass `QtiFeedback`                        | K                 | **S** base class                                                                                                                                             |
| subclass `Qti*InteractionCorrection`          | C                 | **S** base class                                                                                                                                             |
| subclass `Interaction`                        | P (~17)           | **S** base class; entry point is `@citolab/qti-components/qti-base`. Pinned by `qti-assessment-item.extension.api.stories.ts`; guide: Extending interactions |
| consume `testContext` / `computedContext`     | P                 | **S** for component authors; exported from `@citolab/qti-components/qti-base`. `ComputedItem.valid` is published by the item since PR #231                   |
| deep imports (`/exports/*`, `/cdn/exports/*`) | P (+ QTI-Express) | **I**; gone: the entry points are `qti-base` and the other package paths                                                                                     |

### Styling tier: currently missing

| What hosts do today                                                                    | Hosts                                                     | Status                                            |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| inject a stylesheet into `test-container.shadowRoot`                                   | K (`player.ts:189-226`)                                   | **I**; need a supported way to theme              |
| patch interaction shadow DOM (icons, info text), MutationObservers on our shadow roots | K (`qti/item/*.ts`), C (deep query, 39 `shadowRoot` uses) | **I**                                             |
| read `internals.states` / set `internals.ariaChecked`                                  | K (`draggables.ts:65`), C (stats)                         | **I**                                             |
| internal class names `.full-correct-response`, `span.correct-option`, `part~="point"`  | K                                                         | **I** unless promoted to `::part` / custom states |

### Plugin tier: test plugins

A test plugin is a set of elements placed inside `<test-navigation>` that uses only this tier;
the test's own code does not import or refer to it (guide: Storybook "Guides / Test plugins";
first plugin: `tts`). Hosts do not use contexts (only PeilingLezen consumes
`computedContext`/`testContext`); they use properties and events. So this tier is small on purpose.

| Member                                                                 | Hosts       | Status                                                                                                                                                                       |
| ---------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `computedContext.plugins` + request `cito-test-update-plugin-state`    | —           | **S**, new: per-plugin state stored in `state.session.plugins` (#286); the test never reads an entry                                                                         |
| consume `computedContext`                                              | P           | **S**: the one read model: structure, position (`active`), item state, `view`. Provided by `test-navigation`, so plugins live inside it                                      |
| `computedContext.itemElement(identifier)`                              | —           | **S**, new: the rendered `qti-assessment-item`, looked up when called. Replaces `testItemsContext` (never released). A function, so `JSON.stringify` skips it                |
| request: navigate, end attempt, update an outcome, switch view         | K, C (some) | **S** under the new names below                                                                                                                                              |
| notification: navigated                                                | —           | **S**, new: sent only after a navigation succeeded and rendered. Hosts now treat `qti-request-navigation` as "navigated", which is wrong when linear mode refuses it         |
| consume `sessionContext`, `testContext`, `configContext`, `qtiContext` | P (`test`)  | **not plugin API**: `sessionContext` duplicates position and `view`; `testContext` is the responses/outcomes model for hosts and persistence; config and seed are host input |

### Plugin architecture: every optional piece of `qti-test` is a plugin

Branch `feat/test-plugin-architecture`, PR #261, target `next`. A plugin is a set of files that use
only public API and that the core does not refer to. `@qti-components/test` ships and registers all
of them (decided: no per-plugin opt-in import; a host that wants a test without them builds on the
packages underneath).
Text-to-speech (`packages/qti-test/src/tts/`) is the first plugin and the reference
implementation.

**What exists (verified in code 2026-10-12)**

- Five plugins: `print`, `scoring`, `stamp`, `tts`, `view`. `tts` has its own folder; the others
  stay in `components/` (decided: moving them made every `main` fix to those files conflict with
  `next`). `plugins/elements.ts` is the one place that composes them (`pluginElements`); the core's
  `elements.ts` spreads it. Entry for scoped registries: `@qti-components/test/plugins/elements`.
- A plugin reads one context, `computedContext`, plus the request events. `itemElement` is in
  `computed.types.ts` and set by `test-navigation`.
- `plugin-boundary.spec.ts` has a `PLUGINS` list (each with its folders) and fails on a reference to a
  plugin from outside them (except `plugins/`, stories, and `qti-corrections`, which extends `test-check-item`) and on an import of test internals.
- Guide: `packages/qti-test/src/guides/test-plugins.{mdx,stories.ts}`.
- No per-plugin entry points, no umbrella entries, no Step B. The changeset
  (`.changeset/tts-plugin.md`) is `major`: a text-to-speech player must now sit inside
  `<test-navigation>`, and the deep import paths of the plugin files moved.

**Survey of the optional components** (`packages/qti-test/src/components/`, 2026-10-12). Most are
already plugin-shaped: they read only `computedContext` (or `sessionContext`) and talk to the test
through events. Nothing in the core imports them except `elements.ts` (registration) and
`components/index.ts` (re-export), exactly as TTS was before it moved.

| Component                                                                           | Reads                                         | Writes (events dispatched)                       | Verdict                                                                                                |
| ----------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `test-print-context`, `test-print-item-variables`, `test-scoring-feedback`          | `computedContext`                             | none                                             | plugin as is                                                                                           |
| `test-scoring-buttons`                                                              | `computedContext`                             | `test-update-outcome-variable`                   | plugin as is; the write path is that event                                                             |
| `test-stamp`, `test-paging-buttons-stamp`, `test-section-buttons-stamp`             | `computedContext`                             | `qti-stamp-context-updated` (`test-stamp`)       | plugin as is                                                                                           |
| `test-view-toggle`, `test-view`                                                     | `sessionContext`                              | `on-test-switch-view` (`detail` is the view)     | plugin as is                                                                                           |
| `qti-test-feedback`                                                                 | none                                          | none                                             | plugin as is (20 lines)                                                                                |
| `test-check-item`                                                                   | none                                          | `cito-test-end-attempt`, `cito-test-switch-view` | plugin (`view`): switches the session `view` instead of reaching into `test-container` (#280, PR #302) |
| `test-next`, `test-prev`, `test-end-attempt`, `test-item-link`, `test-section-link` | `computedContext` or none                     | `qti-request-navigation`, `test-end-attempt`     | navigation controls: keep in core, or one `navigation` plugin; owner decides                           |
| `qti-number-selected`, `qti-test-variables`                                         | `testContext` + `internal/item-ref-selection` | none                                             | QTI spec elements and internals: core                                                                  |

**The write path is already an API: four events** (`qti-request-navigation`, `test-end-attempt`,
`test-update-outcome-variable`, `on-test-switch-view`), plus `computedContext` and
`sessionContext`. A plugin never needs a method on the test. The events get their public `cito-`
names in the next section.

`test-check-item` reveals the view elements by switching the session `view` (its `view` attribute,
default `scorer`), as `test-view-toggle` does, not by walking `test-container`'s shadow root (#280,
PR #302). It is part of the `view` plugin.
Own `<template>` lookups in the stamp and button components are fine; they read the element's own
children.

**Decided** (issue #275)

- Plugins are files inside `@qti-components/test` (one install, one version), not packages (#276).
- Plugins ship registered with `@qti-components/test`; there are no per-plugin entry points and no
  umbrella entries (host decision, 2026-10-12: one install, with or without the whole package).
  Each plugin's `elements.ts` (`{ tag, ctor }[]`, defines nothing) feeds `plugins/elements.ts`,
  which is the list for scoped registries, because plugin elements inside item-ref templates land
  in `test-container`'s scoped registry.

**Open questions**

- Do the navigation controls join the plugins? (owner decides at triage)

**Conventions** (written in the guide): where the files live, the line in `plugins/elements.ts`, the
`PLUGINS` entry. Prefer widening a context over exposing an element. Plugin
tags and events do not use `qti-` (see Event naming). Before moving a plugin a host uses, add its
`plans/host-migration/` entry in the same commit.

### Event naming: public or internal

The name of an event says whether it is public. Today `qti-` covers both plumbing
(`qti-register-variable`, `qti-item-context-updated`) and supported events (`qti-state-changed`),
and `test-`/`item-` are used by elements and by internal or deprecated requests
(`test-show-correct-response`, `item-switch-view`), so neither prefix tells you.

- **Public events use one prefix that nothing else uses.** Decided: `cito-`, in line with the
  namespace policy (`qti-` belongs to 1EdTech; ours are `cito-`). The scope follows the prefix:
  `cito-test-*`, `cito-item-*`. Alternatives considered: `test-`/`item-` (shares the prefix with
  element tags and internal requests).
- **Everything else is internal** and keeps its name (`qti-*`, `register-*`, `activate-*`, …).
  Internal names may change in any release and are not documented.
- **Public is checkable, not only a convention:** one module declares the public events (name,
  `detail` type, scope, kind) and augments `HTMLElementEventMap`; a spec fails when a `cito-` event
  is dispatched that is not in it, or a declared one is removed.
- **Requests are verbs, notifications are past tense.** All public events bubble and are composed.
  No `on-` prefix (frameworks read `on` as a handler prefix) and no `:` (Angular reads `(a:b)` as a
  target).

| Today                                             | Public name                                                | Kind         | Hosts                  | Path                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------- | ------------ | ---------------------- | -------------------------------------------------------------------------- |
| `qti-request-navigation` `{type,id}`              | `cito-test-navigate`                                       | request      | K, C, P, Playground, … | old name **D**, both handled until the next major                          |
| `test-end-attempt`                                | `cito-test-end-attempt`                                    | request      | —                      | old name **D**, both handled: no host uses it, but topic pages document it |
| `test-update-outcome-variable`                    | `cito-test-update-outcome`                                 | request      | —                      | old name **D**, both handled: no host uses it, but topic pages document it |
| `on-test-switch-view`                             | `cito-test-switch-view`                                    | request      | K, C, Playground, …    | old name **D**; decision 6 adds the `view` property too                    |
| — (new)                                           | `cito-test-navigated` `{type,id}`                          | notification | —                      | new                                                                        |
| `qti-navigation-loading-started`                  | `cito-test-navigation-started`                             | notification | C, Playground          | old name **D**, both sent                                                  |
| `qti-navigation-error`                            | `cito-test-navigation-failed`                              | notification | Playground             | old name **D**, both sent                                                  |
| `qti-navigation-loading-ended`                    | — (use navigated / failed)                                 | —            | Playground             | **D**: it also fires on failure and cancellation                           |
| `qti-test-loaded` `[{identifier,element}]`        | `cito-test-rendered`                                       | notification | K, C, P, Playground, … | old name **D**, both sent                                                  |
| `qti-assessment-test-connected`                   | `cito-test-loaded`                                         | notification | all                    | old name **D**, both sent                                                  |
| `qti-assessment-item-connected`                   | `cito-item-rendered`                                       | notification | all                    | old name stays as internal plumbing; **D** for hosts                       |
| `qti-assessment-item-ref-connected`               | `cito-item-ref-connected`                                  | notification | K                      | old name **D**, both sent                                                  |
| `qti-state-changed`                               | `cito-test-state-changed`                                  | notification | —                      | old name **D**, both sent                                                  |
| `qti-interaction-changed` / `qti-outcome-changed` | `cito-item-response-changed` / `cito-item-outcome-changed` | notification | K, C, P, examenkompas  | old names **D**, both sent                                                 |
| `qti-rubric:discretionary-placement`              | `cito-item-rubric-placement`                               | notification | K, qti-player          | old name **D**, both sent                                                  |
| `qti-test-context-updated`                        | —                                                          | —            | K, C                   | stays **D** (decision 8); no new name                                      |

"Both sent / both handled" means one helper dispatches (or listens for) the old and the new name
for one minor; the old name goes in the next major, with `plans/host-migration/*` entries.

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
   CSS custom states and a theming hook so they can stop. The retired CSS contract audit (`git show 614c666e:plans/css-contract-audit.md`)
   proposed element names, custom states and parts as the styling contract; check the patches
   above against it.
8. **`qti-test-context-updated` stays (deprecated)** until both main hosts are on `state`.
9. **Plugins read one context.** `computedContext` gains `itemElement(identifier)`;
   `testItemsContext` is removed before it is released. Plugins live inside `<test-navigation>`
   (open question: whether `test-navigation` becomes mandatory). `testContext` stays the host's
   model of responses and outcomes.
10. **A real "navigated" notification.** Hosts listen to the navigation request, or to
    `qti-navigation-loading-ended`, which also fires on failure and cancellation.
11. **Hosts patch our DOM because two hooks are missing:** "rendered, here are the elements" and a
    supported way to style inside `test-container`. Hosts use MutationObservers and shadow-root
    queries for both (K, C, Playground); the library should not add observers, it should offer the
    hooks (`cito-test-rendered`, `itemElement`, the styling tier).
12. **Highlights become a native test plugin** (now `dep-textmarker` in C, Playground and
    examenkompas, stored in localStorage per item). It needs per-item plugin state in
    `state.session` and the anchors from decision 4.
13. **The public prefix is `cito-`** (decided 2026-10-09). Nothing else uses it, so the name alone
    says an event is public; `test-`/`item-` were rejected because elements and internal requests
    already use them.

## Status

Checked against the code on 2026-10-12.

### Done

- Astro "Public API" page, one section per tier.
- Migration notes for Kennisnet and CitoTestUit (`testContext` → `state`, `href` from the item-ref, bookmarks → `state.session`).
- `qtiTest.state` and `qti-state-changed` (#225); `qtiContext` provided by `qti-test`.
- Entry points for `Interaction` and the contexts (`@citolab/qti-components/qti-base`); `/exports/*` is gone; extension contract pinned by stories.
- Contract stories for most host-tier and item-tier members.
- Public event prefix decided: `cito-` (decision 13).
- `computedContext.itemElement`; `testItemsContext` removed; text-to-speech reads only `computedContext`.
- Five plugins (`print`, `scoring`, `stamp`, `tts`, `view`) with a guide, an executable contract story and a boundary spec.
- Survey of the optional test components (above).

### Next todos

Tracking issue: **#275** (PR #261 is its first task). Open work lives in issues; this list is the
order and the gaps. Issues #276–#279, #281 and #282 are closed and folded into #275's task list;
the code behind them is not yet verified against it.

1. **Public events** (#275, "Public plugin API"; no issue of its own). One module declares the
   public events and augments `HTMLElementEventMap`; a spec fails on an undeclared `cito-` dispatch
   or a removed declared one. Rename the unreleased and unused names, dual-dispatch the host-used
   ones, one migration entry per host. **Done** for both tiers (`qti-test/src/public-events.ts`, `qti-elements/src/public-events.ts`,
   their specs, changesets, host entries); `qti-test-context-updated` stays as decided.
2. **`cito-test-navigated`**, part of 1. **Done**: sent with `cito-test-rendered`, never on a refused or cancelled navigation.
3. **One boundary spec for all plugins**: **Done**, with the convention write-up in the guide.
4. **`test-check-item`** reveals `[view]` elements without reaching into `test-container` (#280). **Done** in PR #302: it switches the session `view`; part of the `view` plugin.
5. **Move the other optional components into plugins** (#275, was #281): **Done** as `stamp`, `print`,
   `scoring` and `view` next to `tts`. `qti-test-feedback` stays in core: it is a QTI element, not
   a plugin. Navigation controls stay in core.
6. **No Step B.** The plugins ship with `@qti-components/test`, so nothing is removed and nothing
   breaks. Still open from it: #245 (core unaware of the corrections package).
7. **Remaining contract stories**: `showCandidateCorrection` (corrections package), `test-url`,
   `auto-score-items`, `qti-outcome-changed`, `qti-rubric:discretionary-placement`,
   `on-test-switch-view`, `test-show-candidate-correction`, the extension tier, and the four
   write-path events. Issue #240; host-shaped tests #251.
8. **Bookmarks and highlights in `state.session`**: #237 (state: **done** as `session.plugins`, #286), #246 (bookmark component: **done** as `<test-bookmark>`), #247
   (highlights); all unblocked by #275. Highlights need the anchor design first (decision 4), and
   become a plugin (decision 12). `feat/test-item-bookmark` is the branch for bookmarks.
9. **Styling tier**: map what Kennisnet and CitoTestUit patch onto the parts and states the theme
   already exposes (old audit: `git show 614c666e:plans/css-contract-audit.md`), then decide parts
   and states. No issue yet.
10. **Host check**: try a pkg.pr.new build in Kennisnet and CitoTestUit (#241).
11. Optional: survey PeilingLezen in depth, and the 2.x–6.x hosts if their usage still matters.

Not in this branch: any change to `main` (behaviour fixes go there and are merged into `next`),
and the Kennisnet 9.x material in `plans/host-migration/`.
