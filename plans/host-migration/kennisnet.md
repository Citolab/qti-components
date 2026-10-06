# Kennisnet migration

Baseline: `@kennisnet/qti-components` 7.28.1, most likely a republish of ours. Survey is read-only
(2026-10-05): `projects/shared/src/lib/{qti,player}`, `projects/player`. Nothing here was run.

## Unreleased after 9.3.0

### `state` replaces the `testContext` round trip (PR #225)

Status: recommended; nothing breaks on upgrade
Members: `qti-test-context-updated`, `qtiTest.testContext`, `navigateTo`
Do:

- Save from `qti-state-changed` (or read `qtiTest.state`) instead of `qti-test-context-updated`
  (`store/events.ts:85-99`, `actions/persist.ts`). Keep `currentItemId`, `maxIndex`, `submitted`
  and `manualScores` next to the stored state.
- Restore with `qtiTest.state = saved`, before or after load, instead of the `testContext` cast on
  `qti-assessment-test-connected` plus `navigateTo` (`store/events.ts:117-148`).
- Delete the by-hand store rebuild (`mutators.ts:128-161`); it existed because assigning
  `testContext` emitted nothing.
  Evidence: read, not run

### `updateItemVariables` fires and updates immutably (PR #225)

Status: behaviour change (fix)
Members: `updateItemVariables`
Do: remove the "doesn't fire reliably" workaround (`check-item.ts:34-38`). Values no longer need a
`type` unless the item doesn't declare the variable. Values for items not yet loaded are kept.
Evidence: read, not run

### `href` is not in `state` (PR #225)

Status: recommended
Members: `testContext.items[].href`
Do: read `href` from the `qti-assessment-item-ref` where `check-item.ts:48` calls the scoring
backend.
Evidence: read, not run

### Restored template values are kept (PR #226)

Status: behaviour change
Do: nothing if you restore through `state` or `testContext`. A resumed or revisited item now shows
the stored template values instead of drawing new ones.

### Interactions, feedback and `readonly` follow the item context (PR #228)

Status: behaviour change; no API removed, timing kept
Members: `item.setOutcomeVariable`, `item.processResponse`, `item.disabled`, subclass `QtiFeedback`,
`qti-register-feedback`
Do: check these flows before upgrading.

- Modal feedback: restoring variables equal to the declared defaults, with no attempt yet, no longer
  opens a `show-hide="hide"` modal. If the player relied on that, re-apply stored outcomes with
  `setOutcomeVariable` as before (it still shows the modal once the outcome changed).
- The `qti-register-feedback` event is no longer sent. Nothing in the surveyed code listens to it;
  grep for it in `qti/` to be sure.
- Subclasses of `QtiFeedback`: `_context` is now a read-only getter, and `checkShowFeedback()` stays
  public. Remove any write to `_context`.
- Observers on feedback DOM that run right after `setOutcomeVariable`: `showStatus` is still correct
  on return, but the element now decides it itself.
- A `readonly` attribute set from the start now applies.
  Evidence: read, not run

### Deprecated members (PR #225)

Status: deprecated, removed in next major
Do: stop depending on `qti-test-context-updated`; `navItemLoading` / `navTestLoading` were never
set.

## Not in the library, still in the host

- `cache-transform` no longer exists; Kennisnet still sets it, which does nothing. Remove it.
- Shadow DOM patching (`player.ts:189-226`, `qti/item/*.ts`, `draggables.ts:65`) and internal class
  names (`.full-correct-response`, `span.correct-option`, `part~="point"`) are internal and may
  change in a minor. The styling tier in `plans/public-api.md` tracks a supported replacement.
