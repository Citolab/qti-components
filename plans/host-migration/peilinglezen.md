# PeilingLezen migration

Baseline: pinned to 7.1–7.14. Survey is imports only (2026-10-05): about 17 custom interactions on
`Interaction`, deep `/exports/*` imports, consumption of `testContext` / `computedContext`. Nothing
here was run, and the changes between 7.14 and 9.3.0 are not covered by this file.

## Unreleased after 9.3.0

### Nothing required

Status: none
Members: `testContext`, `computedContext`, `Interaction`
Do: no change from PR #225–#227. The consumed contexts are unchanged, and the session context
label change (`sessionContext`) does not affect components that consume it.

### Writing your own interaction on 9.x (documentation and stories only)

Status: upgrade facts, not a change; PeilingLezen is not a priority host
Members: subclass `Interaction` (~17 custom interactions), the deep `/exports/interaction.js` import
Do, when upgrading from 7.14:

- Import `Interaction` from `@citolab/qti-components/qti-base`. The `/exports/*` paths no longer
  exist.
- Add `get response()` and `set response(value)` to every subclass; they are abstract now, so a
  subclass without them does not compile.
- Delete the `@property() responseIdentifier` redeclaration. The base class binds it to the
  `response-identifier` attribute and a redeclaration drops that binding.
  Evidence: the `response` and `responseIdentifier` points checked in this repo (a subclass without
  `response` fails `tsc`; a redeclared property leaves `response-identifier` unset); the import path
  and the redeclaration read from `wielrennen-3.ts`. Which of these already applied between 7.14 and
  9.3.0 is not covered. Guide: Extending interactions.

### Interactions follow the item context (PR #228)

Status: behaviour change; the highest impact of the three for this host
Members: subclass `Interaction` (~17 custom interactions), `qti-register-feedback`
Do: check every custom interaction's `response` setter. The base class now calls it again when the
item's value changes to something the interaction did not publish itself, so a setter must be safe
to call with the same value (no re-render loops, no event dispatch that echoes back). Also:

- A `readonly` attribute set from the start now applies to them.
- The `qti-register-feedback` event is no longer sent; the surveyed imports do not use it.
  Evidence: imports surveyed only, not run

### Item validity is published by the item (PR #231)

Status: behaviour change; nothing required for the surveyed code
Members: `computedContext` (`ComputedItem.valid`)
Do: nothing if no component reads `valid`. One that does now gets a value that stays right after a
restore or after coming back to an answered item; before, it stayed `false` until the next update.
The navigation computed context no longer asks each loaded item to validate on every update.
Evidence: imports surveyed only, not run. `qti-navigation-bar.ts` consumes `computedContext` and does
not read `valid`.

### `state` is available after the upgrade (PR #225)

Status: recommended, once on 9.x
Do: PeilingLezen is a candidate first user of bookmarks and highlights in `state.session`
(`plans/host-api.md`, "Carried over from the host survey" and "Open decisions").

### Restored template values are kept (PR #226)

Status: behaviour change
Do: nothing unless a custom interaction relied on template values being redrawn on revisit.

### Public test events get the `cito-` prefix (public events)

Status: none required (old names are sent and handled until the next major)
Members: `qti-request-navigation`, `qti-test-loaded`
Do: nothing. If the host listens for `qti-request-navigation` to learn that the item changed, use
`cito-test-navigated` instead; it is sent only after the navigation succeeded and rendered.
Evidence: imports surveyed only, not run

### Public item events get the `cito-` prefix (public events)

Status: recommended; nothing breaks on upgrade (old names are sent and handled until the next major)
Members: `qti-interaction-changed`, `qti-outcome-changed`, `qti-assessment-item-connected`
Do: rename as you touch them: `cito-item-response-changed`, `cito-item-outcome-changed`,
`cito-item-rendered`. `detail` is unchanged. Listening for both names runs your handler twice;
pick one.

- `assessment-test.component.tsx:144-148` listens for the first two on the content window.
  `:162-` removes `qti-interaction-changed` but never `qti-outcome-changed`: fix that when renaming.
- `player/src/main.ts:107` and `:233` use `qti-assessment-item-connected` and an empty
  `qti-outcome-changed` handler.
  Evidence: read from `apps/leesvaardigheid/src` and `player/src`, not run

## Next major

### Response processing publishes once; outcome events carry only the final values (feat/processing-as-backend)

Status: behaviour change; no API removed
Members: `qti-outcome-changed`
Do: nothing required. `qti-outcome-changed` and `cito-item-outcome-changed` stay, with the same `detail`
(`{ item, outcomeIdentifier, value }`). What changes is when they come: once per outcome after each
update, with the final value, after the item context is published. An end of attempt no longer sends
the reset to the defaults (SCORE 0, empty FEEDBACK) or a rule's in-between value first, so a handler
sees fewer events. `cito-item-outcomes-changed` is new: the same outcomes in one event
(`{ item, outcomes: [{ identifier, value }] }`).

- `apps/leesvaardigheid/src/app/components/assessment-test.component.tsx:148` listens for
  `qti-outcome-changed` and logs an `outcome-changed` action (`:101`) per outcome: the log gets one
  entry per outcome per attempt, without the reset entries it had before.
- `player/src/main.ts:233` has an empty `qti-outcome-changed` handler; it can go.
- `player/src/components/qti-assessment-item-ref.ts:39-42` reads `detail.outcomeIdentifier`; unchanged.
  Evidence: read from `apps/leesvaardigheid/src` and `player/src`, not run

### completionStatus follows QTI: no longer "answered" (feat/completion-status-qti)

Status: breaking
Members: `completionStatus` (item variables, test context, computed context)
Do: stop reading `completionStatus === 'completed'` as "the candidate answered". It is now `not_attempted`
until the item is shown, `unknown` while it is shown, and `completed` only after an attempt ended
(`processResponse()` or end attempt). For "answered", read `valid && !isDefaultResponse` of the item in the
computed context (or `itemContext.valid` on the item).

- `player/src/components/qti-navigation-bar.ts:103-107`: the "open" count (finishing allowed at 0)
  reads `completed`; count items that are not `valid && !isDefaultResponse` instead.
  Evidence: read from `player/src`, not run

### Public events renamed `qc-*`; the 7.x names are gone (feat/parts-states-vocabulary)

Status: breaking: the 7.x names this host listens to are no longer sent; `cito-*` still sent for one major
Members: `qti-test-loaded`, `qti-assessment-test-connected`, `qti-request-navigation`, `qti-interaction-changed`, `qti-outcome-changed`
Do: move every listener to its `qc-*` name in the same upgrade (same `detail`). Without it the player
silently stops working:

- `player/src/main.ts:110` `@qti-test-loaded` → `@qc-test-rendered`. This handler restores ranges,
  applies flags and sets the container visible; if it never runs the test stays invisible.
- `player/src/main.ts:129` `@qti-assessment-test-connected` → `@qc-test-loaded`. It sets
  `postLoadTransformCallback`; if it never runs items load untransformed.
- `player/src/main.ts:235` `@qti-request-navigation` → `@qc-test-navigated`. The handler cleans up
  after a navigation, so listen to the notification that it happened, not the request.
- `player/src/main.ts:233-234`: the empty `qti-outcome-changed` / `qti-interaction-changed`
  handlers can go.
- `apps/leesvaardigheid/.../assessment-test.component.tsx:143-149`: `qti-interaction-changed` →
  `qc-item-response-changed`, `qti-outcome-changed` → `qc-item-outcome-changed`; remove both in the
  cleanup (`:162-`, which forgets the outcome one today).
- Unchanged: `qti-assessment-item-connected` (`main.ts:107`) stays as internal plumbing (the public
  name is `qc-item-rendered`); `qti-test-connected` is internal and still sent; `qti-flag-item`,
  `qti-mark-item` and `qti-assessment-item-log-event` are the host's own.
  Evidence: read from `player/src/main.ts:104-245`, `assessment-test.component.tsx:140-165`, not run

### One vocabulary for parts and states (feat/parts-states-vocabulary)

Status: none of the names this PR renames are used; the 7.x names below were already gone in 9.x
Members: `::part(ch)`, `::part(slot)`, `::part(dropslot)`, `::part(correct-option)`, `[dragging=""]`
Do: the host's CSS targets 7.x parts (`ch`, `slot` on `qti-simple-choice`, `dropslot`,
`correct-option`) that 9.x no longer renders. When upgrading, rewrite them against qti-theme
`CONTRACT.md` §3, which lists every part and state. The cleanup in `main.ts:120-127, 238-245` queries
`qti-simple-associable-choice[dragging=""]`; on 9.x a chip in flight carries `:state(lifted)` and no
attribute, so check whether the cleanup is still needed at all.
Evidence: read from `apps/leesvaardigheid/src/app/components/item.css:50-139`, `player/src/components/opzoekvragen/*.ts`, `player/src/main.ts`, not run

### Theme inputs are `--qc-*`; `--qti-*` is internal (feat/parts-states-vocabulary)

Status: recommended; nothing breaks
Members: `--qti-primary`, `--qti-primary-light`, `--qti-padding-md`, `--qti-bg-active`, `--qti-border-active`, `--qti-bg`
Do: `player/src/index.css:5-9, 203-207` sets `--qti-*` tokens. They are internal (CONTRACT §11) and
may change in a minor; `--qti-primary`, `--qti-bg`, `--qti-bg-active` and `--qti-border-active`
still exist, `--qti-primary-light` and `--qti-padding-md` do nothing. Set `--qc-color-primary` on
`:root` instead of `--qti-primary` (the tints follow from it), and put part or state CSS in
`test-container`'s `<template><style>` rather than overriding internal tokens.
Evidence: read from `player/src/index.css`, `apps/admin/src/app/components/qti-item.css:30`, not run

### Validity messages are timed like a native form (feat/parts-states-vocabulary)

Status: behaviour change; nothing required if `validate()` has no side effects
Members: subclass `Interaction` (16 custom interactions override `validate()`), `configContext` (`reportValidityAfterScoring: false`)
Do: the base class now calls `validate()` right after the first render and again two frames later,
not only on a change, so it must be safe to call before any answer and must not dispatch or
re-render (`museum-1.ts:105` returns `!!this.selectedBus`, which is fine). A subclass that only
returns a boolean sets no form validity, so its messages and `ComputedItem.valid` behave as before.
`reportValidity()` takes an optional `{ trigger: 'change' | 'submit' }`; without one it is a submit.
For the built-in interactions a too-few message now shows only after a submit or end attempt.
Evidence: read from `player/src/components/opzoekvragen/*.ts` (16 files), `main.ts:288, 324`, not run

### The test plugins moved to `@qti-components/extended` (feat/extended)

Status: breaking only if the player shows `<test-scoring-buttons>` or `<test-view-toggle>`
Members: `<test-scoring-buttons>`, `<test-view-toggle>` (and the other test plugins)
Do: `apps/leesvaardigheid/src/styles.scss:60,88` styles both tags, but no markup with them was found in the host
source; the built player in `public/player/` may render them. If the player does, add `@qti-components/extended`
next to `@citolab/qti-components` in `player/` and `import '@qti-components/extended';` once in `player/src/main.ts`.
The tags and their parts are unchanged, so the SCSS keeps working.
Evidence: searched the host source for the tags, not run; the compiled player was not read

### Nested sections and session control follow QTI (roadmap 1, T1a)

Status: behaviour change; nothing required unless the package nests sections or declares part of a
`qti-item-session-control` below another one
Members: `computedContext` (`testParts[].sections`, `ComputedItem.maxAttempts`, `showFeedback`,
`showSolution`, `allowSkipping`)
Do: nothing for a package with one level of sections and at most one `qti-item-session-control` per
path. Otherwise:

- A nested section is listed once in `computedContext.testParts[].sections`, with only its own
  item-refs; its outer section no longer lists them too, so every item is in the context once (item
  numbers no longer skip). An outer section that only holds subsections has `items: []`.
- Session control inherits per attribute: an item-ref that declares only `show-feedback` keeps its
  section's `max-attempts`, where it used to fall back to the defaults (implementation guide §4.4.2);
  a nested section inherits from its parent section, not from the test part.

Evidence: read from source, not run against the host's packages

### Session control as `item.sessionControl` (roadmap 1, T1b)

Status: breaking
Members: `computedContext` (`ComputedItem.maxAttempts`, `showFeedback`, `showSolution`,
`allowSkipping`)
Do: read `item.sessionControl.maxAttempts` (and `.showFeedback`, `.showSolution`,
`.allowSkipping`) instead of the flat fields, which are gone. `sessionControl` also carries
`allowReview`, `allowComment` and `validateResponses`, all resolved; type `SessionControl` from
`@qti-components/base`. A context the host builds itself (in tests) needs `sessionControl` on
every item. Stamp templates that print one of the four fields read `item.sessionControl.<name>`.
Evidence: searched the host source for the four names: no reads; the compiled player was not read

### Navigation and submission mode from the test part only (roadmap 1, T1d)

Status: breaking
Members: `computedContext` (`testParts[].sections[].navigationMode`, `submissionMode`),
`qti-assessment-section` (`navigationMode`, `submissionMode`)
Do: read `testParts[].navigationMode` and `submissionMode` instead of the section's, which are gone;
a context the host builds itself (in tests) drops them from its sections. The QTI 3 XSD defines both
attributes on `qti-test-part` only, so a `navigation-mode` or `submission-mode` on a
`qti-assessment-section` is now ignored: the part's mode decides Prev and Next, jumps between items
and the attempts lock. A package that relied on a linear section inside a nonlinear part moves
those items into a linear test part of their own.
Evidence: read from qti-components source; the host source was not searched, not run

### Next and Previous follow the test's order in nested sections (roadmap 1, T1)

Status: behaviour change (a fix); nothing required
Members: `<test-next>`, `<test-prev>`, `computedContext` (`testParts[].itemOrder`, new)
Do: nothing. Where a section's item-refs and subsections interleave, Next and Previous now go in
document order; before, they followed `computedContext.testParts[].sections` (depth first), and in a
linear part Next could get stuck. A host that walks the items itself reads them in order with
`itemsInOrder(testPart)` from `@qti-components/test` instead of flattening `sections`.
Evidence: read from qti-components source; the host source was not searched, not run

### A shuffled section keeps its subsections (roadmap 1, T4)

Status: behaviour change (a fix); nothing required
Members: `qti-ordering shuffle="true"` at load, `postLoadTestTransformCallback` (the test XML it gets)
Do: nothing. In a section with `<qti-ordering shuffle="true">`, a subsection now moves as one section
and stays in the test, with its rubric blocks and session control; before, its item-refs were
lifted into the parent and the subsection dropped. Only a subsection with `visible="false"` and
`keep-together="false"` still merges into the parent, and its items keep its session control. A
`visible="true"` subsection with `keep-together="false"` now stays together, as implementation
guide §4.5.2 says. A transform callback that expected only top-level sections after shuffling sees
the subsections.
Evidence: read from qti-components source; the host source was not searched, not run

### `computedContext` is derived anew on every update (roadmap 1, T2c)

Status: behaviour change (a fix); nothing required
Members: `computedContext`, `initContext` (on `test-navigation`)
Do: nothing. `test-navigation` derives the whole context on every update from the test, the item
facts, the test and session contexts and `initContext`, instead of copying the previous context and
changing it. Two things can be seen: a field taken out of `initContext` is gone at the next update
(before, it stayed), and an item's `maxScore` follows its current `MAXSCORE` (before, it lagged one
update behind).
This host sets no `initContext` (searched); `qti-navigation-bar.ts` reads the context and does
not read `maxScore`.
Evidence: read from qti-components source; the host source searched for `initContext`, not run

## Open

- Deep `/exports/*` imports are internal. Documented entry points for `Interaction` and the
  contexts are planned; until then every upgrade may break them.
- Survey the 7.14 → 9.x gap in depth before upgrading.
