# QTI behaviour stories: attempts, completion, feedback, session control

## Goal

Stories that show, in a test constructor's words, what a candidate experiences when an attempt
starts, ends, repeats or is refused — and that check it against the QTI 3 spec, not against what
our code happens to do. They are allowed to fail: a failing story is a to-do for the library, tagged
`xfail`, not a reason to weaken the story.

Two things are kept apart from now on:

- **QTI behaviour**: what the spec says, cited by section. The reader is a test constructor.
- **Our own API**: `processResponse(countNumAttempts)`, `auto-score-items`, `cito-item-set-outcomes`,
  `optimal`/`done`, restore through `variables`, … The reader is a host developer. These stories
  exist and stay, but never in the same file as a QTI behaviour story. Reviewing them for conflicts
  with QTI is a later step (see "Fixes that fall out").

The conventions below are the lasting decision. The story list is work: it turns into issues and
this file goes when they ship (CLAUDE.md, "The backlog is GitHub issues").

## What the spec says (reference, QTI 3 info model unless noted)

| Rule | Where |
|---|---|
| An attempt ends only "in direct response to a user action or … some expected event, such as the end of a test". Response processing happens at the end of each attempt. | §2.5, §2.2.1 |
| `numAttempts` starts at 0 and "increases by 1 at the start of each attempt". The delivery engine maintains it. | §2.2.2.2 |
| `completionStatus` is `not_attempted`, becomes `unknown` at the start of the first attempt, and keeps that value unless response processing sets it. Non-adaptive items need not set it; adaptive items must set `completed` to end the cycle. When an adaptive item sets `completed` the session closes. | §2.2.2.3, §2.5 |
| Non-adaptive: outcomes reset to their defaults before every response processing run; the engine reports the first set of outcomes or limits the attempts. Adaptive: outcomes are retained; the engine reports the last set and must show all applicable feedback. | §2.2.2.3, §2.5, impl. guide §3.7.2 |
| End-attempt interaction: the one used → `true`; every other one, and the engine's own submit, → `false`. Its default value is ignored. | §2.4.5, §5.45 |
| `max-attempts`: non-adaptive only (ignored for adaptive); default 1; 0 = unlimited; a value above 1 means feedback must be shown between attempts. | impl. guide §4.4.2.1 |
| `show-feedback`: whether feedback is shown after the **last** attempt. Default `false`. | impl. guide §4.4.2.2 |
| `allow-skipping="false"`: no submit until at least one response is non-default. Individual submission mode only. | impl. guide §4.4.2.6 |
| `validate-responses="true"`: no submit while any response is invalid. Individual mode only. | impl. guide §4.4.2.7 |
| `allow-review`, `show-solution`: states after the last attempt. | impl. guide §4.4.2.3, §4.4.2.5 |
| Simultaneous submission: no response processing until the test part ends; "one and only one attempt at each item and feedback cannot be seen during the test". Individual: processing during the test, per item. | §2.8.2, impl. guide §4.1 |
| Nonlinear + individual: whether leaving an item ends the attempt is left to the engine; engines differ. | impl. guide §4.1 |

Feedback is not what makes an item adaptive: any item shows feedback from its outcome values after an
attempt (§2.2.1 "in both cases"). Adaptive means the outcomes carry over, so the item can build on
the previous attempt (hint counters, "you saw the solution, SCORE is 0", rules on `numAttempts`).

Adaptive items in a simultaneous part are not a rule conflict; the spec just does not define it. TAO
forces `maxAttempts = 1` in simultaneous mode and runs the one processing pass at the end of the
part; a hint button pressed during the part is stored as a response and never shows its hint. We
document the same degradation rather than detect a conflict.

How three engines read the same rules (checked 2026-10-23: TAO `qti-sdk` `AssessmentItemSession`,
amp-up `qti3-item-player` `QtiAssessmentItem.vue`, QTI.JS `session.js`/`processing.js`):

- All three count `numAttempts` only on a real submit. amp-up has `getScoreAttempt()` — score, no
  feedback, no count — which is our `processResponse(false)`.
- All three reset outcomes for non-adaptive items and keep them for adaptive ones.
- TAO sets `completionStatus = completed` after every ended attempt of a non-adaptive item; the
  suite's Results Reporting reference results expect the same.
- `count-attempt` on the end-attempt interaction: TAO ignores it, amp-up and QTI.JS always count. QTI
  2.x defined it with default `true`; QTI 3 gives no default. Our "absent = not counted" is the odd
  one out. **Decided 2026-10-23: absent counts**, as in 2.x, amp-up and QTI.JS. Implemented on this branch (#341);
  story 4b asserts it.
- `numAttempts` on open: §2.2.2.2 says it "increases by 1 at the start of each attempt", so a
  presented item would be at 1. All three engines, and we, count when the attempt ends. **Decided
  2026-10-23: stay at 0 and say so** in story 1's docstring; results files carry the count of ended
  attempts.

## What the official suite covers (1EdTech/qti-conformance @ `b058156e`, grep of the whole repo)

Covered, by sample and criterion:

- **T5-L2-D1** unlimited attempts (`max-attempts="0"`) — local story is still a `todo` placeholder.
- **S1-L2-D1 / S1-L2-D2** (in T12) `allow-skipping` true/false per section — local stories exist.
- **Results Reporting, Test Case 2, runs #2e–#2h**: multiple attempts per item, `numAttempts`,
  `completionStatus`, outcomes reset between attempts, skipped items. Stories exist on
  `test/conformance-results-reporting` (eleven items, eight reference result files).
- Every interaction sample's "after ending the attempt …" criteria: one attempt, one processing run.

**Not in the suite at all** (zero samples in `qti3.0/` and `qti2.2/`): `adaptive="true"`,
`qti-end-attempt-interaction`, `qti-modal-feedback` / `qti-feedback-block` / `qti-feedback-inline`,
finite `max-attempts` > 1, `show-feedback`, `validate-responses`, `allow-review`, `show-solution`,
`submission-mode="simultaneous"` (only incidentally in the S3/S4 ordering sample). The Delivery
Certification Checklist lists "End Attempt Interaction", "Modal Feedback" and "Item Session
Control" as capabilities, so they are certifiable, but there is no sample to run.

So the suite gives us the groundwork for non-adaptive multiple attempts and nothing for the rest.
Everything else below is spec-derived, with the spec's own example items as fixtures where it has
them (impl. guide §3.7.2: "Show Solution" and the template-block adaptive items; §4.8.2: a section
with `max-attempts="0"`).

## Where our code stands (2026-10-23)

Everything is in one local branch, `feat/qti-attempts-completion` (worktree
`.claude/worktrees/feat-qti-attempts-completion`), off `next`, not pushed. One commit per problem:

| Commit | What |
|---|---|
| `66e61155` | feat(item)!: response processing runs like a backend, the item publishes once |
| `0e06ff3e` | feat(item): the other end-attempt responses become `false` when an attempt ends (§2.4.5) |
| `b12c1feb` | feat(item)!: completionStatus follows QTI 3 |
| `13b43d91` | changeset text for `cito-item-set-outcomes` follows `b12c1feb` |
| `5b638274` | fix(test-navigation): no throw when an item has no completionStatus |
| `8f88c642` | test(item): the QTI behaviour stories below, API stories split off |
| `c6092203` | fix(processing): a boolean condition applies only when it is `true` (#340) |
| `a2e0ff36` | fix(hotspot-interaction): no throw when the image is an `<object>` (needed by the next one) |
| `d63c62a3` | test(conformance): Results Reporting test case 2 stories |

Set aside, not in the branch (still uncommitted in the root checkout on `next`, and saved as patches):

- **Attempts lock**: `test-navigation` disables an item once its attempts are used. It breaks
  `docs/formative-test.stories.ts`: that demo keeps the package plain (default `max-attempts` 1) and
  lets the candidate check again, as Kennisnet does. Open decision.
- **Feedback events** (`cito-feedback-show` / `cito-feedback-hide`): written against the old
  processing, where a repeat attempt reset the outcome first. Since `66e61155` the item publishes
  once, so the spec "asks again on a repeat attempt … turns off and on" fails and the changeset
  text is wrong. Needs rework on top of this branch.

Full suite on the committed branch: all pass except 4 `test-end-attempt.stories.ts` stories, which
fail the same way on `next` itself (`226065eb`). Still found while reading: `auto-score-items` calls
`processResponse(true, …)` on every change (#299).

## Conventions

### Two kinds of story, never in one file

| | QTI behaviour | Our API |
|---|---|---|
| Tag | `qti-spec` | `cito-api` |
| Title | `QTI behaviour/<topic>` (component level), `Testing/Conformance/spec/<topic>` (test level) | `API Reference/<topic>` |
| Reader | test constructor | host developer |
| Docstring | cites the spec section(s); where the spec leaves it to the engine, says so and names our choice | describes the member |
| Drives the item through | what a candidate can do: click, type, drag, press the item's or the test's buttons | any public member |

### Where a story lives

- **Needs only a `qti-assessment-item`** (built from web components or one item XML): next to the
  component it is about, in its `stories/` folder, with the existing suffix taxonomy
  (`.behavior.`, `.api.`, …). Attempts and completion are the item's: `packages/qti-elements/src/components/qti-assessment-item/stories/`.
- **Needs a whole `qti-assessment-test`** (session control, submission mode, `test-end-attempt`,
  navigation): under `apps/e2e/src/stories/`. Spec-derived scenarios go in a new sibling of the
  suite folders: `conformance/spec/<topic>/`. Suite samples stay in `conformance/basic|advanced|elective/`,
  named by criterion ID as now. `spec/` is not `elective/` because the conformance matrix reads
  `elective/` as suite coverage, and not `cito/` because these are the spec's rules, not ours.
- Fixtures: a spec example item is copied verbatim into a `fixtures/` folder next to the story and
  reached through a `*.fixtures.ts` constant (CLAUDE.md, Fixtures). The docstring names the spec
  section it comes from.

Component stories elsewhere in `packages/*` that load a whole test are left as they are; moving them
is out of scope here.

### What makes a story readable for a test constructor

1. The story name is a sentence about the candidate: *"I ask for a hint, then answer"*, not
   `EndAttemptInteractionResetsOthers`.
2. Every `step` is one thing the candidate does or one thing the candidate sees, in plain words:
   *"Press Check"*, *"The feedback 'Correct!' appears"*, *"The Check button is greyed out"*. A step
   never says `processResponse`, `dispatchEvent` or `shadowRoot`.
3. Assert what the candidate sees first (feedback visible or not, a button enabled or not, the
   solution shown); then the QTI variables, by their QTI names (`numAttempts`, `completionStatus`,
   `SCORE`, the end-attempt response), because that is what a results file will carry.
4. The story does only what a candidate could do. No `processResponse()`, `setOutcomeVariable`,
   `variables =`, no synthetic events. If a behaviour cannot be reached from the UI, that is a
   finding about the library, not a reason to call a method.
5. One scenario per story; the scenario reads top to bottom as a short script. Variations (wrong
   answer, second try) are steps in the same script when the candidate would experience them in one
   sitting, separate stories otherwise.
6. The docstring says which spec sentence this script demonstrates, and when the spec leaves it to
   the engine, says "QTI leaves this to the engine; we do X".
7. Known gaps are tagged, not softened: `xfail` for a written story the library fails, `todo` for a
   placeholder (both already excluded from CI runs in `vitest.config.ts` and badged in the sidebar).

## Stories

Stories need `b12c1feb`; on a branch without it, 1 and 2 fail. Item-level status is measured; test-level
status is still what I expect.

### Item level — `qti-assessment-item.attempts.behavior.stories.ts`, title `QTI behaviour/Attempts and completion`

Written. Tag `qti-spec`. Candidate actions go through `shadow-dom-testing-library` (`findByShadowRole`)
and `userEvent`; the item element is read only for its variables. "Sees" means the text has layout
boxes (`Range.getClientRects()`): feedback hides content in a closed slot, which `toBeVisible` and the
host's `checkVisibility` both miss. Status checked on `test/qti-behaviour-stories`; each `xfail` was
run untagged and fails for the reason its docstring gives.

| # | Story (candidate's words) | Script | Checks | Spec | Fixture | Status |
|---|---|---|---|---|---|---|
| 1 | I open an item | Item appears. | Question and Check visible, no feedback; `numAttempts` 0 (see decision above); `completionStatus` `unknown`; `SCORE` 0. | §2.2.2.2–3 | "capital" choice item built from components, end-attempt Check (`count-attempt="true"`) | pass |
| 2 | I answer and press Check | Choose Amsterdam. Press Check. | Only the correct feedback shows; `numAttempts` 1; `completed`; `SCORE` 1. | §2.2.1, §2.5 | same | pass |
| 3 | I try again with the same answer | Choose, Check, Check. | `numAttempts` 2; `SCORE` 1 (the rule is SCORE + 1, so 1 proves the reset). | §2.2.2.3, §2.5 | same | pass |
| 4 | I ask for a hint, then answer | Choose. Hint (`count-attempt="false"`). Check. | After Hint: hint shows, HINT `true`, CHECK `false`, `numAttempts` 0. After Check: answer feedback replaces hint, HINT `false`, CHECK `true`, `numAttempts` 1. | §2.4.5 | same plus Hint and a HINT feedback block | pass (since #340's fix, `c6092203`) |
| 4b | A Check button that does not say whether it counts, counts | Check without `count-attempt`. | `numAttempts` 1. | §5.45, decision above | same, attribute left out | pass (#341) |
| 5 | I give up and look at the solution | Press Show Solution. | Solution and "since you viewed the solution" text show; the button is hidden; "Correct" not shown; `completed`; `SCORE` 0; SOLREQUEST `true`. | impl. §3.7.2, §2.5 | `fixtures/example03-feedback-block-solution.xml`, the spec item verbatim plus a provenance comment, imported `?raw` (a single file, CLAUDE.md Fixtures) and loaded through `qtiTransformItem()` | pass. The "then answer" half is dropped: the item is completed, so its session is closed (§2.5), and there is no candidate submit at item level |
| 6 | The item builds on my last try | Rotterdam, Check; Amsterdam, Check. | Try 1: "try again" shows, `incomplete`, `SCORE` 0. Try 2: correct feedback replaces it, `completed`, `SCORE` 1 (2 − one retained wrong try). | §2.5, §2.2.2.3 | capital item, `adaptive="true"`, hint-counter processing | pass |
| 6b | I cannot try again once the item is done | Amsterdam, Check. | `completed`; Check is disabled. | §2.5 | same | pass (#342) |

Moved out: the old file (title `API Reference/Attempts and completion`, every story drives
`processResponse`) is now `qti-assessment-item.attempts.api.stories.ts`, tag `cito-api`, title
unchanged. It stays its own file rather than joining `qti-assessment-item.api.stories.ts` (`Host
API`), because its helpers are its own. `CompletionFollowsValidity` was already replaced by
`ValidityIsNotCompletion` on this base.

### Test level — `apps/e2e/src/stories/conformance/spec/attempts/`, title `Testing/Conformance/spec/Attempts and completion`

| # | Story | Script | Checks | Spec | Fixture | Status |
|---|---|---|---|---|---|---|
| 7 | I submit with the test's own button | Item with a Hint end-attempt. Answer. Press the test's End Attempt. | Feedback shows; `numAttempts` 1; the item's HINT response is `false`. | §2.4.5 | one-item test, individual | pass |
| 8 | I get two tries, then it locks | `max-attempts="2"`. Answer wrong, End Attempt. Answer right, End Attempt. | After try 1: feedback shows (attempts remain, so feedback must show), button still enabled. After try 2: button disabled; `numAttempts` 2. | impl. §4.4.2.1 | one-item test | pass (`test-end-attempt` already does this) |
| 9 | I can try as often as I like | `max-attempts="0"`: End Attempt three times. | Button never disables; `numAttempts` 3. Replaces the `T5-L2-D1` `todo` using the suite's own T5 package. | impl. §4.4.2.1; T5-L2-D1 | suite T5 | pass |
| 10 | No feedback after my last try | `max-attempts="1"`, `show-feedback="false"`. Answer, End Attempt. | No feedback visible; `numAttempts` 1. Then the same with `show-feedback="true"`: feedback visible. | impl. §4.4.2.2 | one-item test ×2 | to verify |
| 11 | I can't hand in an empty answer | `allow-skipping="false"`. Press End Attempt with nothing chosen. Choose, press again. | First press refused (button disabled); after choosing it works. | impl. §4.4.2.6; S1-L2-D2 | one-item test | pass |
| 12 | I must give a valid answer | `validate-responses="true"`, `min-choices="2"`. Choose one, End Attempt. Choose two, End Attempt. | First refused; second accepted. | impl. §4.4.2.7 | one-item test | to verify (we have `require-answer`, not `validate-responses`) |
| 13 | A paper-style test: everything is marked at the end | `submission-mode="simultaneous"`, two items. Answer item 1, Next, answer item 2, finish the part. | During: no feedback, `numAttempts` 0 on both. After the part ends: each item processed once, `numAttempts` 1, feedback per `show-feedback`. | §2.8.2, impl. §4.1 | two-item test | expected `xfail` (we have no end-of-part processing; autoscore stands in) |
| 14 | A hint button in a paper-style test | Simultaneous part, item 4's Hint. Press Hint. | Nothing shows; no attempt counted. Docstring: "QTI leaves this undefined; like TAO we treat the part as one attempt per item." | §2.8.2 | same as 13 | expected `xfail` |

### Fixes that fall out (separate issues, not stories)

- #340 (done in `c6092203`) Boolean conditions: `QtiConditionIfBase.shouldProcess` (`qti-processing/src/components/qti-condition/qti-condition-base.ts`)
  returns the expression's raw value, and a boolean variable's value is the string `'true'`/`'false'`,
  so `<qti-response-if><qti-variable identifier="X"/>` always runs once X has a value. The spec's
  §3.7.2 examples use exactly this (`SOLREQUEST`, `seenSolution`). Fixes story 4.
- #341 (done on this branch) End-attempt `count-attempt` absent → counts (decided above). Fixes story 4b. A breaking change for
  items that relied on "absent = not counted": `next`, changeset `major`, host-migration entries.
- #342 (done on this branch) An adaptive item that sets `completed` closes its session (§2.5): disable its end-attempt
  interactions. Fixes story 6b.

- `auto-score-items` must call `processResponse(false, …)`: scoring a change is not an attempt (§2.5).
  Document autoscore as our stand-in for end-of-part processing in simultaneous mode.
- `T5-L2-D1` placeholder becomes story 9.
- Later, with the `cito-api` stories as the inventory: review each of our hooks for conflicts with the
  spec rows above (`optimal` gating of Next, `require-answer` vs `validate-responses`, autoscore).

## Open questions

1. ~~Base branch~~: `test/qti-behaviour-stories`, off `test/conformance-results-reporting` (decided
   2026-10-23). `feat/end-attempt-false` and `feat/completion-status-qti` still duplicate parts of it.
2. ~~`count-attempt` default~~: counted (above).
3. Tag names `qti-spec` / `cito-api`: in use now; neither has a sidebar badge yet. Badge them in
   `.storybook/manager.ts`, or leave them as filters only?
4. Should the conformance matrix learn to show `spec/` stories (it reads criterion IDs; these have
   none), or is a sidebar folder enough for now?
