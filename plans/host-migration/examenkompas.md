# Examenkompas migration

Baseline: `@citolab/qti-components` 7.27.4 (`apps/examenkompas`; `apps/functions` pins 7.27.3 and was
not surveyed). React (Vite). Survey is read-only (2026-10-12): `apps/examenkompas/src/lib/ui/components/examen/assessment.tsx`,
`assessment-test-container.tsx`, `src/app/logic/qtiClient.ts`, `src/app/query/examens.ts`. Nothing here was run.

Examenkompas is one `<qti-test>` with `<test-navigation>`, `<test-container>`, scoring buttons and feedback, item links,
and its own navigation (list, thumbnails, previous/next). It keeps the whole `TestContext` on a server
(`qtiApi.setTestContext`), plus its own fields (`navItemId`, `referrer`, scores).

The 7.28 → 9.3 steps in `kennisnet-migration-guide-9x.md` apply as far as they concern members used here;
the entries below say which. `plans/public-api.md` has no column for this host yet.

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
