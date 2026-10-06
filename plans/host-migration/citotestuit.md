# CitoTestUit migration

Baseline: `@citolab/qti-components` 9.3.0 (vendored tgz). Survey is read-only (2026-10-05):
`frontend/packages/ui/src/assessment-player`, student store, admin review stats. Nothing here was
run.

## Unreleased after 9.3.0

### `state` replaces the `testContext` round trip (PR #225)

Status: recommended; nothing breaks on upgrade
Members: `qti-test-context-updated`, `qtiTest.testContext`, `navigateTo`
Do:

- Save from `qti-state-changed` instead of `qti-test-context-updated`
  (`AssessmentPlayerView.tsx:663-725`). Its payload is built after the update, so the live
  `qtiTest.testContext` read for stale payloads (`:641-661`) is no longer needed. Keep the debounce
  and the awaited flush at hand-in.
- Restore once with `qtiTest.state = saved`, replacing the guarded `testContext` assignment plus
  `navigateTo(navItemId)` (`:1495-1530`). `navigate="section"` now starts at the restored section.
  Evidence: read, not run

### Keep the seed and bookmarks where they are (PR #225)

Status: recommended
Do:

- `test-navigation.qtiContext` with `asSeed` (`:1481-1490`) keeps working. The seed is not in
  `state`: pass it on every load or the restored order changes.
- Bookmarks (`marked` on context items, `assessmentStore.ts:342-372`) are not in `state` yet. Keep
  `testContext` for them until `state.session` carries bookmarks (`feat/test-item-bookmark`).
  Evidence: read, not run

### Restored template values are kept (PR #226)

Status: behaviour change
Do: nothing if you restore through `state` or `testContext`. Review screens that set
`item.variables` for a student now see the template values the student answered.

### Interactions, feedback and `readonly` follow the item context (PR #228)

Status: behaviour change; no API removed, timing kept
Members: `item.variables` / `item.responses` setters, subclass `Qti*InteractionCorrection`
Do: check these flows before upgrading.

- Review and replay screens that assign `item.variables` or `item.responses` and read the
  interactions right after: rendered interactions still take the values synchronously, and one that
  registers later picks them up. An answer the candidate just gave is not overwritten.
- An unanswered item no longer overwrites a `response` attribute set on an interaction.
- `Qti*InteractionCorrection` subclasses and the deep shadow queries and MutationObservers in the
  admin stats: the base class now adopts values itself, so re-check what they patch.
- A `readonly` attribute set from the start now applies.
  Evidence: read, not run

### `qtiContext` is provided by `qti-test`; `test-navigation.qtiContext` is an alias (Phase 3, PR #230)

Status: deprecated (the alias works unchanged); recommended
Members: `test-navigation.qtiContext` (the `qtiContext={runtimeQtiContext}` prop and the
read-then-write that merges the seed), `asSeed`
Do:

- Nothing breaks on upgrade. React sets the prop on `<test-navigation>` before the element is
  attached to `<qti-test>`; the alias holds the value and hands it over when the navigation
  connects, so the seed is in place before `test-container` shuffles. A story builds the elements
  in React's order and passes on 9.3.0 and on the new code.
- Recommended: put `qtiContext={runtimeQtiContext}` on `<qti-test>`, next to
  `configContext={PLAYER_CONFIG_CONTEXT}`, and drop the effect that merges the seed in afterwards.
  `runtimeQtiContext` already carries the seed. This is the same lesson as config: write on the
  element that provides it. `<test-navigation>` still fills in `testIdentifier` on load, into the
  same value.
- Behaviour change: components inside `<qti-test>` but outside `<test-navigation>` now read the
  context. Before they got an empty default.
- Writing the alias prints one console warning per element naming the replacement; the recommended
  move above removes it. Removal of the alias is in the next major: use `qtiTest.qtiContext`.
  Evidence: read from `AssessmentPlayerView.tsx:1481-1490` and `:2173-2218`, not run

### Components inside a test find it through context (PR #232)

Status: behaviour change; nothing required
Members: `postLoadTestTransformCallback`, `<template item-ref>` on `qti-test`
Do: nothing. Both are still set on `<qti-test>`. They are now also honoured when `test-container` or
the item-refs are rendered inside a component's own shadow root, where they used to be skipped
silently. Also, the library attaches a `ContextRoot` to the page on load, so a component that
upgrades before the element providing its context still gets the value; nothing changes for code that
registers in order.
Evidence: read from `AssessmentPlayerView.tsx:2173-2186` (`<template item-ref>` and the test
elements in light DOM), not run

### Deprecated members (PR #225)

Status: deprecated, removed in next major
Do: stop depending on `qti-test-context-updated`; `navItemLoading` / `navTestLoading` were never
set.

## Not in the library, still in the host

- `item.resetInteractions` no longer exists; the host already calls it with `?.`.
- Deep shadow queries (39 `shadowRoot` uses) and `internals.states` reads in the admin stats are
  internal and may change in a minor.
