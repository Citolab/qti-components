# Reactive state: context-driven components and a single persist/restore API

## Goal

Make the library's **state** fully reactive through the Lit contexts that are
already in place (config, session, qti, test, computed, item, interaction), and
give third-party hosts one simple contract:

```js
qtiTest.state = await load(); // valid before or after the test loads
qtiTest.addEventListener('qti-state-changed', e => save(e.detail)); // debounce in the host
```

The whole library does _not_ need to become query-free. Reading the QTI XML from
the light DOM is correct, because the light DOM is the data model. The part
worth fixing is where state is pushed or pulled by hand instead of flowing
through context. That is also why restoring a session is fragile.

Line references below are against `main` at `81a5929b`.

Status (2026-10-06): Phase 1 is in PR #225, the template-value fix in PR #226.
Which members are public, and how the main hosts (Kennisnet, CitoTestUit) use
them, is in `plans/public-api.md`. Read that before Phase 2: it changes what
counts as breaking below.

## Phase 0: Discovery (done)

### DOM queries by kind

About 250 production lines query the DOM (`.stories`/`.spec` excluded). The
shares are rough estimates from reading the grep output.

| Kind                                         | Share    | Examples                                                                                                                                                  | Remove?                                                                                                                                                                       |
| -------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A.** Reading the QTI XML                   | ~half    | `qti-response-declaration.ts:67-108`, `qti-outcome-declaration.ts:43-75`, session-control cascade in `test-navigation.ts:240-296`                         | **No.** Read once on connect.                                                                                                                                                 |
| **B.** Finding child elements by selector    | ~quarter | `choices.mixin.ts:119`, `drag-drop-interaction-mixin.ts:153-160`, `qti-assessment-item.ts:319` (`qti-response-processing`), `test-processing.mixin.ts:36` | **Mostly.** Children register themselves (already done for interactions, variables, feedback), or the parent catches `context-request` as `drag-drop-core.mixin.ts:168` does. |
| **C.** Pushing or pulling state by hand      | small    | see below                                                                                                                                                 | **Yes.** This is the real gap.                                                                                                                                                |
| **D.** Lookups in the component's shadow DOM | ~10%     | `interaction.ts:216`, `qti-modal-feedback.ts:58`, `qti-extended-text-interaction.ts:181`                                                                  | Yes: `@query` or `ref()`. Cosmetic only.                                                                                                                                      |
| **E.** Real DOM work                         | ~10%     | text-to-speech reading elements, stimulus injection, image sizing                                                                                         | No.                                                                                                                                                                           |

### C in detail: components subscribe to context but get values pushed anyway

1. `qti-assessment-item.ts:116-125`: the `variables` setter writes
   `interaction.response = …` on each registered interaction. Interactions
   subscribe to `itemContext` (`interaction.ts:21`) but never read their value
   from it. Only the PCI does (`qti-portable-custom-interaction.ts:921`).
2. `qti-assessment-item.ts:127-131` and `:228`: the item calls
   `checkShowFeedback()` on each feedback element. `qti-feedback.ts` already
   subscribes to `itemContext` and could derive `showStatus` itself.
3. `qti-assessment-item.ts:61-63`: `readonly` is copied onto each interaction by
   hand.
4. `test-base.ts:52-58`: finds the item-ref with `querySelector`, then sets
   `assessmentItem.variables` on it.
5. `test-base.ts:139-170`: reads the private `(assessmentItem as any)._context`
   and writes variables back. Restoring from the test is a one-off sync when the
   item connects, not a subscription.
6. `test-navigation.ts:452`: calls `assessmentItem.validate(false)` on every item
   for every update. Items should publish their own validity.
7. `test-navigation.mixin.ts:553`: `qti-test` reads the shuffle seed via
   `querySelector('test-navigation').qtiContext`. The parent reaches into a
   child, so `qtiContext` is provided at the wrong level. It belongs on
   `qti-test`.
8. `test-container.ts:78` and `qti-assessment-item-ref.ts:106-111` find the test
   with `closest('qti-test')`. They should get it from context.

**Caveat for (1):** an interaction that takes its value from context feeds back
into itself (it emits, the context updates, it gets set again). Interactions must
also keep working without an item around them. The pattern: keep the internal
value, and in `willUpdate` adopt the context value only when it differs from
what the interaction last emitted.

### The contexts and what to store

There are 8 shared contexts, not 6. `itemContext` and `computedItemContext` are
the extra two, plus the internal `dragDropContext` and text-to-speech context.

| Context                 | Provided by                    | Holds                                                                   | Store it?                                                                                                        |
| ----------------------- | ------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| config                  | `qti-test`, `qti-item`         | delivery options                                                        | **No.** The host passes it in on every load.                                                                     |
| qti                     | `test-navigation`, `qti-item`  | candidate, environment, `seed`                                          | **No.** But the host must pass the same seed on reload, or the shuffle order changes.                            |
| session                 | `qti-test`                     | `navPart/Section/ItemRefId`, `view`, `navItemLoading`, `navTestLoading` | **Partly.** Store the position. `view` is a role and belongs in config. The two loading flags are never written. |
| test                    | `qti-test`                     | `items[].variables`, `items[].state` (PCI), test outcomes               | **Yes.** These are the answers.                                                                                  |
| computed / computedItem | `test-navigation` / `qti-item` | read model derived from the others                                      | **Never.**                                                                                                       |
| item                    | `qti-assessment-item`          | live item variables                                                     | Not separately; rolls up into `test.items[]`. A standalone `qti-item` needs its own `variables` + `state`.       |
| interaction             | each interaction               | choice role, drag selector                                              | **Never.**                                                                                                       |

### Problems found against that model

- **No session-change event.** Only `qti-test-context-updated` exists
  (`test-base.ts:150`), so a host can't store the candidate's position without
  polling.
- **The stored data is bloated and includes the answer key.** `testContext`
  copies full variable declarations, including `correctResponse`, `mapping` and
  `areaMapping` (`variables.ts:65-67`, `test-base.ts:166`). Storing
  `{identifier, value}` per variable plus `state` is enough.
- **Restoring is undocumented and timing-dependent.** Loading the test document
  resets `testContext` and `sessionContext` (`test-base.ts:72-75`). Then
  `qti-assessment-test-connected` replaces `items` (`:84-96`). A host that sets
  `qtiTest.testContext = saved` before load has it wiped.
- `sessionContext` is created with `Symbol('testContext')`
  (`session.context.ts:16`). It works, but the devtools label is misleading.
- **Bookmarks and highlights belong in session:** they're per-candidate, don't
  affect scoring, and should be stored. Where they're stored (database,
  localStorage, sessionStorage) is the host's choice. The library never touches
  storage itself.

### Host-facing contract

```ts
type QtiTestState = {
  version: 1;
  test: {
    items: {
      identifier: string;
      variables: { identifier: string; value: unknown }[];
      state?: Record<string, string | null>;
    }[];
    outcomes: { identifier: string; value: unknown }[];
  };
  session: { navItemRefId?: string; bookmarks?: string[]; highlights?: Record<string, unknown[]> };
};
```

`config` and `qti` stay inputs that the host sets as properties. `computed`,
`item` and `interaction` stay internal.

## Breaking-change assessment

Done as additive steps, all of it can ship as minors. Only these would break if
done outright, and each has a non-breaking path:

| Step                                            | Breaking?                | Notes                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. `state` + `qti-state-changed` + slim format  | **No**                   | New API only. `testContext` and `qti-test-context-updated` stay as they are.                                                                                                                                                                                                                                                                                             |
| 2. Interactions/feedback read from item context | **API no, timing yes**   | `item.variables = x` still restores responses, but on Lit's next update instead of immediately. Code that reads `interaction.response` right after setting `variables` would see the old value. Keep the base class calling the `response` setter so third-party subclasses still work, and keep `checkShowFeedback()` public. Release as a minor with a changelog note. |
| 3. `qtiContext` provider on `qti-test`          | **Yes if done outright** | Hosts set the seed and candidate on `test-navigation.qtiContext` (`navigation.mdx:10,28`). Add the provider on `qti-test` and keep `test-navigation`'s as a deprecated alias (nearest provider wins). Remove it in a major.                                                                                                                                              |
| 4. Child registration / `@query`                | **No**                   | Internal. The one risk is choices added after the interaction connects; the specs should cover it.                                                                                                                                                                                                                                                                       |

Cleanups that would break if done directly:

- Moving `view` out of `sessionContext` breaks `test-view`, `test-view-toggle`
  and any host reading `sessionContext.view`. Mirror it into config and
  deprecate the old field instead.
- Removing `navItemLoading`/`navTestLoading` breaks TS users. Mark them
  `@deprecated` first.
- Renaming the `sessionContext` symbol description is not breaking.

Removals go together in one later major.

## Phase 1: `state` API on `qti-test` (done, PR #225)

- `packages/qti-test/src/types/qti-test-state.ts` defines the stored format. Per
  item it keeps `{identifier, type, value}` per variable plus interaction
  `state`, then test outcome values and the position. It contains no
  `correctResponse`, `mapping`, `baseType` or `cardinality`, and no `view`,
  config or `qtiContext`.
- `packages/qti-test/src/mixins/test-state.mixin.ts` sits directly on top of
  `TestBaseMixin`:
  - A state set early is held and applied once the test connects (after the
    items list is built, before initial navigation), so the test opens at the
    stored item or section.
  - A state set later is applied right away. Items already on screen are
    updated, and the test navigates to the stored position if it differs.
  - Stored positions pointing at items or sections the test no longer has are
    dropped. A state with an unknown `version` is ignored with a warning.
  - `qti-state-changed` is not sent while a test is loading, and not when nothing
    stored changed. A host can never save an empty state over a real one.
- Fixes along the way:
  - `test-base.ts`: saved interaction state (e.g. PCI `getState()`) is now handed
    to an item when it loads. Before, it was lost on reload.
  - `test-navigation.mixin.ts`: `navigate="section"` starts at the restored
    section instead of always the first.
- Docs at `apps/site/src/content/docs/qti-test/persist-and-restore.mdx`, with a
  sidebar entry. The changeset bumps `@qti-components/test` and
  `@citolab/qti-components` as minors.
- `test-state.spec.ts`: 12 specs. Verified they can fail: removing the
  `test-base` fix breaks 1, removing the loading guard breaks 3.
- Added in the same PR:
  - The Persist & restore page is cut down to the host contract (assign
    `state`, listen to `qti-state-changed`, pass the same seed). It is the
    first page of the public API.
  - `qti-test/stories/qti-test.api.stories.ts`: a contract story that uses only
    the public API (answer, save from the event, resume a fresh test). Verified
    it fails without the restore.
  - Deprecated: `qti-test-context-updated` (use `qti-state-changed`) and
    `SessionContext.navItemLoading` / `navTestLoading`.
  - The e2e formative-correction story is now a saving host (sessionStorage).

### Known gaps in phase 1

- [x] **`updateItemVariables()`** changed `testContext` in place, so it
      triggered no update and no `qti-state-changed`, and dropped values for
      items not loaded yet. It now replaces the test context, and the state
      restore calls it. It stays supported (not deprecated): Kennisnet uses it
      for backend scoring. `type` is optional; an optional third argument sets
      per-interaction state.
- [x] **Template variables** were overwritten by template processing after the
      restore, so a revisited or resumed randomized item showed different
      values. Fixed in PR #226 (`qti-assessment-item` keeps restored template
      values and still derives correct responses from them).
- [ ] **On-screen PCIs:** assigning `state` after load doesn't re-initialize a
      PCI that's already displayed. It picks up the state when its item loads
      again. The docs say this.
- [ ] **Standalone `qti-item`** has no `state` yet. Neither main host uses it.
- [x] **Session-change event**: `qti-state-changed` fires on position changes
      too.
- [ ] **`bookmarks` / `highlights` in `session`.** CitoTestUit stores bookmarks
      as `marked` on context items today; PeilingLezen is a candidate first
      user. Highlights need anchors that survive a reload. Separate branch,
      `feat/test-item-bookmark`, on top of this work.

### Follow-ups

- [ ] **Seeded template randomness.** `qti-random` and `qti-random-integer` use
      `Math.random()`. When `QTI_CONTEXT.seed` is set, use a generator seeded
      from seed + item identifier. Without a seed keep `Math.random()`, so
      candidates don't all get the same numbers. This adds to #226, it does not
      replace it: stored values survive library and item changes, a seed does
      not.
- [x] `sessionContext` created with `Symbol('testContext')`: relabelled.

## Before Phase 2: pin the public API

The host survey (`plans/public-api.md`) showed that Phases 2 and 4 touch
members hosts depend on. Before changing internals:

- [x] Contract stories for the host and item tiers, in the style of
      `qti-test.api.stories.ts`:
  - `qti-test/stories/qti-test.host.api.stories.ts`: `navigateTo`, the
    `qti-request-navigation` event, the lifecycle events, `qti-interaction-changed`,
    `updateItemVariables`, `configContext`, the seed on `test-navigation.qtiContext`, and the
    deprecated `qti-test-context-updated`.
  - `qti-assessment-item/stories/qti-assessment-item.api.stories.ts`: `setOutcomeVariable` (feedback
    on synchronously, which Phase 2 must keep), `processResponse`, `variables` / `responses`,
    `disabled`, `assessmentItemRefId`.
  - Each was checked by breaking the code it covers. Not covered: `showCandidateCorrection` (lives in
    `qti-corrections`, see `plans/public-api.md`), and the MutationObserver patching Kennisnet does
    after a reveal.
- [x] The Astro public API page, `apps/site/src/content/docs/public-api.mdx`, from the tables in
      `plans/public-api.md`. Merging it makes those statuses official.

## Phase 2: Interactions and feedback read from item context (C1–C3)

- [x] Interactions adopt their response from `itemContext` (`Interaction`, `qti-base`). Done
      with a `ContextConsumer` callback, not `willUpdate`: a subclass overriding `willUpdate`
      without `super` would silently skip it, and a callback keeps the timing the item's push
      had, so there is no timing change for a rendered interaction. The rules that keep it from
      fighting the candidate:
  - it reacts only to a change in _this_ response's value, not to any context update;
  - it skips a value equal to what the interaction last published. That is tracked from the
    interaction's own `qti-interaction-response` events, which every emitter dispatches on the
    interaction, and not by reading `response` back: the getter has no common shape (the
    drag-drop interactions return one comma-joined string where they publish an array), and
    comparing against it broke the associate interaction;
  - the first value is adopted only when it is non-empty, so an unanswered item does not wipe a
    `response` attribute;
  - before the first render it waits, then looks at the latest value.
- [x] `qti-feedback` decides its own `showStatus` from `itemContext` (`ContextConsumer`
      callback, synchronous), when its outcome changed or once an attempt was made.
      `checkShowFeedback()` stays public. The item no longer keeps a list of feedback elements and
      the `qti-register-feedback` event is gone.
- [x] `readonly` flows through context (`ItemContext.readonly`). A `readonly` attribute on the item
      from the start now applies; before, only a change after first render did.
- [x] `disabled` is published in `ItemContext.disabled` and followed like `readonly` (PR after #228). The
      item keeps no interaction list for it anymore. An interaction authored `disabled` stays so inside an
      item that does not mention it.
- [x] Changeset with the notes above.

Not changed after all: a host that sets `item.variables` and reads `interaction.response` straight
after still sees the new value, because the adoption is synchronous for a rendered interaction.
The contract stories (`qti-assessment-item.api.stories.ts`) pin that, plus the three adopt rules.

Risk found by the host survey: the timing change is not only about reading
`interaction.response` after setting `variables`. Kennisnet calls
`setOutcomeVariable` and expects modal feedback right away, and patches choice
states with MutationObservers right after a reveal. CitoTestUit sets
`item.variables` / `responses` for its review screen. The contract stories
above must cover these first.

## Phase 3: `qtiContext` on `qti-test`, context instead of `closest()` (C7–C8)

- [x] Provide `qtiContext` on `qti-test`. `test-navigation.qtiContext` is a deprecated alias that
      reads and writes the enclosing test's value, rather than a second provider that "nearest wins"
      would let drift from it. It must keep working: CitoTestUit writes its per-session seed there.
      Written before the navigation is inside a test, it is handed over on connect. The test now reads
      the seed from itself, not through `querySelector('test-navigation')`.
- [ ] Replace `closest('qti-test')` in `test-container.ts` and `qti-assessment-item-ref.ts` with
      context. **Undecided; recommendation is to leave them.** Both read something the host put on
      `qti-test` and no context carries: `postLoadTestTransformCallback` (a function) and the
      `<template item-ref>`. They find their own host, not shared state. Doing it means a new context
      that exists only for this, which is new API for little gain.
- [x] Remove the `test-base` private-field access (C4–C5): the item exposes a read-only
      `itemContext`, and the test reads that. The one-off sync on connect stays a one-off.
- [x] Remove the per-update `validate()` sweep (C6): the item publishes `ItemContext.valid` whenever
      it checks (an answer changes, it connects, answers arrive through `variables`), the test carries
      it into the test context, and navigation reads it. This also fixed a bug: after a restore or
      coming back to an answered item the computed `valid` stayed `false` (the sweep read it before
      the answer was adopted), which kept `test-end-attempt` disabled in a no-skipping section.

## Phase 4: Child registration and `@query` (B, D)

- [ ] Replace B lookups with self-registration or `context-request` handling.
- [ ] Replace D lookups with `@query` / `ref()`.
- [ ] Cover choices added after the interaction connects.

A and E stay as they are.

Risk found by the host survey: PeilingLezen subclasses `Interaction` about 17
times and consumes `testContext` / `computedContext` through deep `/exports/*`
imports. If base classes and contexts are public (extension tier in
`plans/public-api.md`), changing how children register with `Interaction` is
breaking. Give them proper entry points and contract tests first.

## Deprecations to schedule for the next major

The published list, with what replaces each and which ones warn, is
`apps/site/src/content/docs/deprecations.mdx`. Keep it in step with this one.

- `test-navigation.qtiContext` provider (once `qti-test` provides it)
- `sessionContext.view` (mirrored into config)
- `navItemLoading` / `navTestLoading` (marked `@deprecated` in #225)
- `qti-test-context-updated` (marked deprecated in #225). Remove only after
  Kennisnet and CitoTestUit are on `state`; Kennisnet still needs item `href`
  from the item-ref.
