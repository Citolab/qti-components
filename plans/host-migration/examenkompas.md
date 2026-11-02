# Examenkompas migration

Baseline: `@citolab/qti-components` 7.27.4 (`apps/examenkompas`; `apps/functions` pins 7.27.3 and was
not surveyed). React (Vite). Survey is read-only (2026-10-12): `apps/examenkompas/src/lib/ui/components/examen/assessment.tsx`,
`assessment-test-container.tsx`, `src/app/logic/qtiClient.ts`, `src/app/query/examens.ts`. Nothing here was run.

Examenkompas is one `<qti-test>` with `<test-navigation>`, `<test-container>`, scoring buttons and feedback, item links,
and its own navigation (list, thumbnails, previous/next). It keeps the whole `TestContext` on a server
(`qtiApi.setTestContext`), plus its own fields (`navItemId`, `referrer`, scores).

The 7.28 → 9.3 steps in `kennisnet-migration-guide-9x.md` apply as far as they concern members used here;
the entries below say which.

## 7.27.4 → 9.3.0

### Config option renamed (8.0)

Status: deprecated; the old name still works
Members: `configContext.disableAfterIfMaxChoicesReached`
Do: rename to `disableAfterMaxReached` (`assessment.tsx:468-471`). `reportValidityAfterScoring` stays.
Evidence: read, not run

### Interaction parts

Status: verify
Members: `::part(textarea)`, `::part(input)`, `::part(select)`
Do: the rules in `info-texts.tsx:39-61` keep their parts on 9.x (`textarea` on extended text, `input` on
text entry); check `select` on inline choice with a visual pass. The `qti-simple-choice[role="radio"]` rules
(`:65-72`) read `role` from the choice; check them on a choice interaction.
Evidence: read, not run

### Imports

Status: none
Members: `@citolab/qti-components`, `/qti-test` (`IQtiTest`, `QtiAssessmentItemRef`, `QtiAssessmentTest`), `/qti-transformers`, `/react`
Do: nothing; all four entry points exist on 9.x. `postLoadTransformCallback`, `postLoadTestTransformCallback`,
`auto-score-items` and `initContext` are unchanged.
Evidence: read, not run

## Unreleased after 9.3.0

### `state` replaces the `testContext` round trip (PR #225)

Status: recommended; nothing breaks on upgrade
Members: `qtiTest.testContext`, `navigateTo`, `qti-assessment-test-connected`
Do:

- Store `qtiTest.state` (or the `cito-test-state-changed` event, below) instead of the whole `testContext` that
  `setTestContext` sends (`qtiClient.ts:249`). Keep `navItemId`, `referrer` and the scores next to it
  (`examens.ts:142-148, 220-224`).
- Restore with `qtiTest.state = saved`, replacing the `testContext` cast plus `navigateTo`
  (`assessment.tsx:281-289`) on the connected event. The state restores the position too.
- Reading `testContext.items[].variables` for the navigation (`assessment.tsx:325-345`) still works; the
  `computedContext` has the same data per item.
  Evidence: read, not run

### Public events get the `cito-` prefix (public events, PR #285)

Status: recommended; nothing breaks on upgrade (old names are sent and handled until the next major, and a request sent under an old name logs a warning)
Members: `qti-interaction-changed`, `qti-outcome-changed`, `qti-assessment-test-connected`, `qti-request-navigation`, `qti-assessment-item-connected`, `on-test-switch-view`
Do: rename as you touch them (`assessment.tsx:199-212`, and `qtiinteractionchanged` / `qtioutcomechanged` in
`assessment-test-container.tsx:29-30`): `cito-item-response-changed`, `cito-item-outcome-changed`,
`cito-test-loaded`, `cito-test-navigated`, `cito-item-rendered`, `cito-test-switch-view`. Two points:

- `qti-request-navigation` is used to close the lists once the item changes (`assessment.tsx:~296`). It fires
  when navigation is requested, not when it succeeded; `cito-test-navigated` fires after it succeeded and rendered.
- `on-test-switch-view` is dispatched (`assessment.tsx:266, 434`) and listened to (`:204`). Dispatch
  `cito-test-switch-view` and listen to the same.
- The `qti-test-loaded` event you dispatch on `window` (`assessment.tsx:275`) is your own and has the name
  of a library event (renamed `cito-test-rendered`); rename yours to avoid confusion.
  Evidence: read, not run

### Bookmarks: `<test-bookmark>` replaces the localStorage set (test plugin architecture)

Status: recommended; nothing breaks on upgrade
Members: `<test-bookmark>`, `bookmarkedItems`, `state.session.plugins.bookmarks`
Do: put `<test-bookmark>` in the toolbar (or in `<template item-ref>`, one per item) instead of the own toggle (`assessment.tsx:686-690`), drop the
`bookmarks` set and its `bookmarkStorageKey` read and write (`:148-174`), and mark the lists and thumbnails from
`bookmarkedItems(computedContext)` instead of `item.bookmarked` passed through `initContext`
(`:390, 452-458`; `item-list.tsx`, `item-thumbs.tsx`, `item-navigation.tsx`). The marks are part of `state`, which you
store. Existing marks in localStorage need one carry-over: on first load, dispatch
`cito-test-update-plugin-state` with `{ plugin: 'bookmarks', value: [...saved] }`, then clear the key.
Evidence: read, not run

### Plugins ship with `@qti-components/test`

Status: none
Members: `test-print-context`, `test-print-item-variables`, `test-scoring-buttons`, `test-scoring-feedback`
Do: nothing. They are plugins in the source, but `@qti-components/test` still registers them; no extra import.
Evidence: read, not run

## Next major

### Drag-and-drop interactions don't disable their targets at `max-associations` by default

Status: behaviour change; none for this host
Members: `configContext` (`disableAfterMaxReached`, `disableAfterIfMaxChoicesReached`)
Do: nothing. Without the option, match, gap match, associate and order now let the candidate go over
`max-associations` and show the max-selections message, as choice interactions already did. This host
sets `disableAfterIfMaxChoicesReached: true` (`apps/examenkompas/src/lib/ui/components/examen/assessment.tsx:469`), which keeps targets disabled at the maximum.
Drop the option to get QTI's behaviour (go over, see the message).
Evidence: read from `apps/examenkompas/src/lib/ui/components/examen/assessment.tsx:469`, not run

### Response processing publishes once; outcome events carry only the final values (feat/processing-as-backend)

Status: behaviour change; no API removed
Members: `qti-outcome-changed`
Do: nothing required. `qti-outcome-changed` and `cito-item-outcome-changed` stay, with the same `detail`
(`{ item, outcomeIdentifier, value }`). What changes is when they come: once per outcome after each
update, with the final value, after the item context is published. An end of attempt no longer sends
the reset to the defaults (SCORE 0, empty FEEDBACK) or a rule's in-between value first, so a handler
sees fewer events. `cito-item-outcomes-changed` is new: the same outcomes in one event
(`{ item, outcomes: [{ identifier, value }] }`).

The handler (`outcomeChanged`, passed as `itemChanged` in `digitaal.tsx:588`, via `assessment.tsx:200`,
`:208` and the `qtioutcomechanged` mapping in `assessment-test-container.tsx:29`) bumps a tick in
`assessment.tsx:184-187`; it now ticks once per outcome per update instead of at every step.
Evidence: read, not run

### completionStatus follows QTI: no longer "answered" (feat/completion-status-qti)

Status: breaking
Members: `completionStatus` (item variables, test context, computed context)
Do: stop reading `completionStatus === 'completed'` as "the candidate answered". It is now `not_attempted`
until the item is shown, `unknown` while it is shown, and `completed` only after an attempt ended
(`processResponse()` or end attempt). For "answered", read `valid && !isDefaultResponse` of the item in the
computed context (or `itemContext.valid` on the item).

- `apps/examenkompas/src/lib/ui/components/examen/assessment.tsx:258-264, 365-392, 407-418`: the
  view switch, enabling scoring and AI review read `completed`.
- `item-navigation.tsx:26`, `item-thumbs.tsx:45`, `item-list.tsx:41`: nav and thumbnail status.
- `apps/functions/src/app-specific/examenkompas.ts:339-341`: the report's `completed` feeds
  `toetsVolledigBeantwoord`.
  Evidence: read, not run

### One vocabulary for parts and states (feat/parts-states-vocabulary)

Status: breaking in the next major; old names still set in this one
Members: `::part(textarea)`, `::part(input)`, `::part(trigger)`
Do: these three are unchanged. Any own CSS on drag chips, verdict badges or the answer key moves to the
names in qti-theme `CONTRACT.md` §3 (`::part(chip)`, `::part(bank)`, `::part(correction candidate-correct)`,
`:state(answer-key)`); the old names keep working until the next major.
Evidence: read from `assessment.tsx:1063-1071`, not run

### Public events renamed `qc-*` (feat/parts-states-vocabulary)

Status: breaking for the 7.x names; `cito-*` deprecated, still sent for one major
Members: `qti-interaction-changed`, `qti-outcome-changed`
Do: listen to and dispatch the `qc-*` names (`cito-test-navigate` → `qc-test-navigate`, `cito-test-rendered` →
`qc-test-rendered`, `cito-item-response-changed` → `qc-item-response-changed`, …; same `detail`). The `cito-*`
names are still sent and handled for one major, so this can wait, but the 7.x names (`qti-interaction-changed`, `qti-outcome-changed`) are no
longer sent or handled: the answer and score listeners in `assessment.tsx` move to `qc-item-response-changed` and `qc-item-outcome-changed` (same `detail`) in the same upgrade.
Evidence: read from the event table of the public-API survey (examenkompas), not run

### Theme inputs renamed `--qc-*`; buttons read `--button-*` (feat/parts-states-vocabulary)

Status: recommended; old names read as fallbacks for one major
Members: `::part(textarea)`, `::part(input)`, `::part(trigger)`; the Tailwind classes on `test-next` / `test-prev`
Do: nothing breaks. The controls keep their classes and `::part(button)`; a brand look for the items
is a block of `--qc-*` values on `:root` (CONTRACT §8), and any CSS on parts or states goes in
`test-container`'s `<template><style>` (CONTRACT §11).
Evidence: read from `assessment.tsx:1063-1071`, not run

### Validity messages are timed like a native form (feat/parts-states-vocabulary)

Status: behaviour change; nothing required
Members: `configContext` (`reportValidityAfterScoring: false`; `validationDisplayMode` left at `'inline'`)
Do: nothing. Students stop seeing "Please select at least 1 …" while answering (for example after
dragging a chip back out of a target): a too-few message now shows only after a submit or end
attempt; too-many still shows at once. Validity is set from the first render, which matters only
inside a `<form>`; the player has none.
Evidence: read from `assessment.tsx:460-472`, not run

### The test plugins moved to `@qti-components/extended` (feat/extended)

Status: breaking
Members: `<test-item-link>`, `<test-scoring-buttons>`, `<test-scoring-feedback>`, `<test-view>`, `<test-bookmark>`, `bookmarkedItems`
Do: add `@qti-components/extended` as a dependency (it has `@citolab/qti-components` as a peer, same major) and
import it once next to `@citolab/qti-components` in `src/main.tsx:10` and `.storybook/preview.tsx:5`
(`import '@qti-components/extended';`). The umbrella no longer registers these tags; without the import the item
links (`item-thumbs.tsx:68`, `item-navigation.tsx:49`, `item-list.tsx:68`), the scoring buttons
(`assessment.tsx:514,769`) and the scoring feedback (`assessment.tsx:570,825`) stay unknown elements. Their
attributes and markup are unchanged, so `digitaal.tsx:178` (finding `test-scoring-buttons` by tag) and the CSS for
`test-view` and `test-scoring-feedback` (`styles.css:216-225`) keep working. The JSX types of these tags come from
`@qti-components/extended/react` now, next to `@citolab/qti-components/react`. Import `bookmarkedItems` from
`@qti-components/extended`. The zoom and character-sheet entries below need the same import.
Evidence: read from the files named, not run

### Zoom: `<test-zoom-in>`, `<test-zoom-out>`, `<test-zoom-reset>` replace the own zoom pill (test plugin architecture)

Status: recommended; nothing breaks on upgrade
Members: `<test-zoom-in>`, `<test-zoom-out>`, `<test-zoom-reset>`, `zoomLevel`, `state.session.plugins.zoom`
Do: put the three buttons in the `ek-zoom-pill` instead of the own buttons (`assessment.tsx:697-720`),
drop the `zoom` state with `zoomIn` / `zoomOut` / `resetZoom` (`:149, 312-314`) and the
`style={{ zoom }}` on `<test-container>` (`:977`): the plugin sets `zoom` on each rendered
`qti-assessment-item` instead, so the container's padding and scrollbar stay at 100%.
`step="0.1" min="0.75"` on the out button and `max="1.75"` on the in button keep the limits. The
level is part of `state`, which you store, so it survives a reload. Replaces the workaround of
zooming the container from React state.
Evidence: read from `apps/examenkompas/src/lib/ui/components/examen/assessment.tsx:149,312-314,697-720,977`, not run

### Character sheet: `<test-character-sheet>` replaces `dep-symbol-picker` (test plugin architecture)

Status: recommended; nothing breaks on upgrade
Members: `<test-character-sheet>`, `::part(sheet)`, `::part(key)`
Do: put `<test-character-sheet characters="+ € è é ë ê ï ö à á § ±">` in the toolbar and drop
`dep-symbol-picker` (`dep-web-components/dep-symbol-picker.ts`, registered in
`dep-web-components/register.ts:3`; as far as read it is registered but not placed in
`assessment.tsx`). The plugin follows the focus itself (the last answer field of a rendered item that
had focus, through shadow roots), inserts at the caret, replacing a selection, and dispatches `change`
as well as `input`, so the interaction records the answer without the host's walk through
`shadowRoot.activeElement` (`dep-symbol-picker.ts:79-106`). It is disabled until a field had focus and
has no draggable window. Style it with `::part(sheet)` and `::part(key)` instead of the `buttoncolor`
/ `hovercolor` / `textcolor` attributes. Replaces the workaround of a host-side picker that finds the
active element itself.
Evidence: read from `apps/examenkompas/src/lib/ui/dep-web-components/dep-symbol-picker.ts:1-20,79-120,160-190`,
`register.ts:3`, not run
