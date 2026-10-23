# Kennisnet migration

Baseline: `@kennisnet/qti-components` 7.28.1, most likely a republish of ours. Survey is read-only
(2026-10-05): `projects/shared/src/lib/{qti,player}`, `projects/player`. Nothing here was run.

Build and test check of 2026-10-09 (typecheck of the QTI layer, nothing run in a browser):
`kennisnet-rapport-bouwen-en-testen.md` (report for Kennisnet, Dutch),
`kennisnet-migration-guide-9x.md` (step-by-step guide for a developer or coding agent).

## Unreleased after 9.3.0

### Inline choices are as wide as their widest option (inline-choice autosize)

Status: behaviour change
Members: `configContext` (`inlineChoiceAutosize`)
Do: nothing to keep working. An inline choice now measures its options and is as wide as the
widest from the start, so choosing no longer widens the field and reflows the sentence. Items with
a `qti-input-width-*` class are unchanged. To keep the old look (the field sized to the option shown),
set `inlineChoiceAutosize: false` in `configContext`. The host does not set this option today.
Evidence: read, not run

### Tier-1 theme tokens (feat/theme-tokens)

Status: recommended; nothing breaks on upgrade
Members: `--qti-primary`, `--qti-fg`, `--qti-border-radius`, `--qti-border-thickness` and the other
tokens the brand sheet sets
Do: nothing is required, the old names are aliases and still win. To move, set the tier-1 names
instead (`--cito-color-primary`, `--cito-color-success`, …, `--cito-radius-field`,
`--cito-border-width`); see `packages/qti-theme/CONTRACT.md` §8. A part of a page can carry its own
theme on an element with `data-qti-theme`.
Evidence: from our model brand sheet `apps/e2e/src/stories/kennisnet/kennisnet.css`; the host's own
CSS not surveyed

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

### `disabled` follows the item context (PR #229)

Status: behaviour change; no API removed
Members: `item.disabled`
Do: check the lock on a submitted item. Setting `item.disabled = true` still locks the interactions
and `false` unlocks them.

- A `disabled` attribute present on the item from the start now applies. Before, only a change after
  the first render did.
- An interaction authored `disabled` stays so inside an item that does not mention `disabled`.
- An interaction that registers after the item was disabled comes up disabled.
  Evidence: read from `store/actions/submit.ts:147` and `store/events.ts:44`, not run. Entry added
  after the PR merged; it should have gone in with it.

### Deprecated members (PR #225)

Status: deprecated, removed in next major
Do: stop depending on `qti-test-context-updated`; `navItemLoading` / `navTestLoading` were never
set.

### Public test events get the `cito-` prefix (public events)

Status: recommended; nothing breaks on upgrade (old names are sent and handled until the next major)
Members: `qti-request-navigation`, `on-test-switch-view`, `qti-test-loaded`, `qti-assessment-test-connected`,
`qti-assessment-item-ref-connected`, `qti-state-changed`, `qti-navigation-loading-started`, `qti-navigation-error`
Do:

- Listen for `cito-test-navigated` where you used `qti-request-navigation` as "the item changed":
  it is sent only after the navigation succeeded and rendered. In linear mode a refused navigation
  still fires `qti-request-navigation` but never `cito-test-navigated`.
- Rename the rest as you touch them: `cito-test-navigate`, `cito-test-switch-view`,
  `cito-test-rendered`, `cito-test-loaded`, `cito-item-ref-connected`, `cito-test-state-changed`,
  `cito-test-navigation-started`, `cito-test-navigation-failed`. Table: `docs/public-api.mdx`, "Public events".
- `qti-navigation-loading-ended` stays for now but also fires on failure and cancellation; use
  navigated / failed instead.
  Evidence: read, not run

### Public item events get the `cito-` prefix (public events)

Status: recommended; nothing breaks on upgrade (old names are sent and handled until the next major)
Members: `qti-interaction-changed`, `qti-outcome-changed`, `qti-assessment-item-connected`, `qti-rubric:discretionary-placement`
Do: rename as you touch them: `cito-item-response-changed`, `cito-item-outcome-changed`,
`cito-item-rendered`, `cito-item-rubric-placement` (cancelable, like the old one). `detail` is
unchanged. Listening for both names runs your handler twice; pick one.
Evidence: read, not run

### Section link in item mode has an active item (#332)

Status: behaviour change (fix); nothing to do
Members: `navigate="item"`, `navigateTo`
Do: nothing, unless the host sends a `section` request (`navigateTo('section', id)` or a
`test-section-link`) while `navigate="item"`. Then the section's first item is now the current
item: `test-next`/`test-prev` work from it, and `test-check-item`, `test-end-attempt` and the
scoring buttons act on it. The whole section still renders.
Evidence: read, not run

## Next major

### Drag-and-drop interactions don't disable their targets at `max-associations` by default

Status: behaviour change; none for this host
Members: `configContext` (`disableAfterMaxReached`, `disableAfterIfMaxChoicesReached`)
Do: nothing. Without the option, match, gap match, associate and order now let the candidate go over
`max-associations` and show the max-selections message, as choice interactions already did. This host
sets `disableAfterIfMaxChoicesReached: true` (`projects/shared/src/lib/qti/qti-test.ts:74`), which keeps targets disabled at the maximum.
Drop the option to get QTI's behaviour (go over, see the message).
Evidence: read from `projects/shared/src/lib/qti/qti-test.ts:74`, not run

### Response processing publishes once; outcome events carry only the final values (feat/processing-as-backend)

Status: behaviour change; no API removed
Members: `qti-outcome-changed`, `cito-item-outcome-changed`
Do: nothing required. `qti-outcome-changed` and `cito-item-outcome-changed` stay, with the same `detail`
(`{ item, outcomeIdentifier, value }`). What changes is when they come: once per outcome after each
update, with the final value, after the item context is published. An end of attempt no longer sends
the reset to the defaults (SCORE 0, empty FEEDBACK) or a rule's in-between value first, so a handler
sees fewer events. `cito-item-outcomes-changed` is new: the same outcomes in one event
(`{ item, outcomes: [{ identifier, value }] }`).

- `projects/shared/src/lib/qti/events.ts:10`, `:21` and `:43` declare and list `qti-outcome-changed`
  with this `detail`; they keep working. Optionally move to `cito-item-outcomes-changed` (recommended)
  to handle an update at once.
  Evidence: read from `projects/shared/src/lib/qti/events.ts`, not run

### `cito-item-set-outcomes` applies a backend's outcomes at once (feat/processing-as-backend)

Status: recommended
Members: `updateItemVariables`, `setOutcomeVariable`
Do: when outcomes come from a backend, send them on the item in one event,
`item.dispatchEvent(new CustomEvent('cito-item-set-outcomes', { detail: { outcomes: [{ identifier, value }, …], responseProcessed: true } }))`,
instead of one `setOutcomeVariable` per outcome: the item publishes once and feedback is not shown and
hidden again in between. Leave `responseProcessed` out when replaying stored outcomes that end no attempt.
The item has applied everything when `dispatchEvent` returns.
Evidence: read, not run

### completionStatus follows QTI: no longer "answered" (feat/completion-status-qti)

Status: breaking
Members: `completionStatus` (item variables, test context, computed context)
Do: stop reading `completionStatus === 'completed'` as "the candidate answered". It is now `not_attempted`
until the item is shown, `unknown` while it is shown, and `completed` only after an attempt ended
(`processResponse()` or end attempt). For "answered", read `valid && !isDefaultResponse` of the item in the
computed context (or `itemContext.valid` on the item).

- `projects/shared/src/lib/player/store/items.ts:74`: the Nakijken button is enabled on `completed`;
  use `valid && !isDefaultResponse`, else it stays disabled until after checking.
- `selectors.ts:177-200` (`answeredItemIds`) and `items.ts:58,65`: unlocking the next question and the
  nav markers read `completed`; same replacement.
- The host's own writes of `completed` after backend scoring (`check-item.ts:59`, `submit.ts:49`) keep working.
  Evidence: read from `projects/shared/src/lib/player/store/`, not run

### An item is locked once its attempts are used (test-navigation attempts lock)

Status: breaking for practice tests
Members: `test-navigation`, `qti-item-session-control` `max-attempts`
Do: give a practice test unlimited attempts in its package: `<qti-item-session-control max-attempts="0" />`
on the test part (or section, or item-ref). `test-navigation` now disables an item once a non-adaptive item
has used its `max-attempts`, and QTI's default is 1, also for a package without `qti-item-session-control`.
A plain practice package therefore locks each question after its first Nakijken, and the candidate can no
longer change the answer and check again. TAO and QTI.JS read the default the same way. Tests that should
allow one attempt need nothing.

- The Formative test docs page (which follows Kennisnet's practice player) needed exactly this change in
  its package (`public/assets/docs/getting-started/assessment.xml`).
- Check whether Nakijken counts an attempt in Kennisnet's player (`cito-test-end-attempt` or
  `processResponse()` do; a backend's `cito-item-set-outcomes` does not count by itself). If it does not, the
  lock never fires there.
  Evidence: from the Formative test docs page, not from Kennisnet's source; not run

## Not in the library, still in the host

- `cache-transform` no longer exists; Kennisnet still sets it, which does nothing. Remove it.
- Shadow DOM patching (`player.ts:189-226`, `qti/item/*.ts`, `draggables.ts:65`) and internal class
  names (`.full-correct-response`, `span.correct-option`, `part~="point"`) are internal and may
  change in a minor. The styling tier in `plans/public-api.md` tracks a supported replacement.
