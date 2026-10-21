# @qti-components/elements

## 1.10.0-next.4

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3

## 1.10.0-next.3

### Patch Changes

- [#309](https://github.com/Citolab/qti-components/pull/309) [`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Record-cardinality responses for portable custom interactions. A `qti-response-declaration` with `cardinality="record"` now reads its correct response (`qti-value field-identifier="…" base-type="…"`) into a field map and keeps the declared field base types. A PCI that reports a record in QTI Appendix C JSON (`{ record: [{ name, base: { float | point | … } }] }`) has it stored as that field map (`{ time: '4.12', point: '455 250' }`) instead of `"[object Object]"`, gets it back in `boundTo` typed by the declaration, and receives the record correct response in `responseDeclaration`. `qti-field-value` accepts a variable declared with `cardinality="record"` and reports the field's base type, so `qti-gte`/`qti-lte` compare a float field and `qti-inside` tests a point field. `qti-correct` returns a record's correct response. `BaseType` gains `point`, and `@qti-components/base` exports `RecordValue`, `isRecordValue`, `readRecordFieldValues` and `inferRecordFieldBaseType`.

  Comparisons (`qti-gt`, `qti-gte`, `qti-lt`, `qti-lte`) with a NULL operand are NULL (false), as in QTI: a missing response or a missing record field used to count as 0, so `lte(RESPONSE, 5)` passed without a response.

  The PCI iframe takes the language of the interaction (the nearest `lang` or `xml:lang`, else the page's `lang`) instead of always `lang="en"`, so a PCI that follows `lang` shows its own texts in the item's language.

- Updated dependencies [[`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a)]:
  - @qti-components/base@2.5.0-next.2

## 1.10.0-next.2

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1

## 1.10.0-next.1

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0

## 1.10.0-next.0

### Minor Changes

- [#285](https://github.com/Citolab/qti-components/pull/285) [`b1ea89b`](https://github.com/Citolab/qti-components/commit/b1ea89b72109f8acc7f73b88fce920cb453c21a3) Thanks [@herrKlein](https://github.com/herrKlein)! - The item's public events get the `cito-` prefix, declared in `public-events.ts` and exported from `@qti-components/elements`: `cito-item-response-changed`, `cito-item-outcome-changed`, `cito-item-rendered` and `cito-item-rubric-placement` (cancelable). `detail` is unchanged.

  - **Deprecated:** `qti-interaction-changed`, `qti-outcome-changed` and `qti-rubric:discretionary-placement` are still sent and handled next to the new names, and go in the next major. An old name sent into the test logs a one-time `console.warn` naming the new one. A rubric listener that cancels either name keeps the block where it is.
  - `qti-assessment-item-connected` stays: it is internal plumbing for the test and item container. Hosts use `cito-item-rendered`.

  Host entries: `plans/host-migration/{kennisnet,citotestuit,peilinglezen}.md`.

## 1.9.0

### Minor Changes

- [#228](https://github.com/Citolab/qti-components/pull/228) [`b0f1c6d`](https://github.com/Citolab/qti-components/commit/b0f1c6d4cc885d361247ac41973874659f6494e0) Thanks [@herrKlein](https://github.com/herrKlein)! - Interactions, feedback and `readonly` now follow the item context instead of being pushed to by the item. The public members are unchanged, and the timing was kept on purpose: `item.variables = …` shows the values in rendered interactions straight away, and `setOutcomeVariable` / `processResponse` leave `showStatus` correct when they return. This is covered by this repo's own stories and specs. It has not been run against a host application, so hosts should check the flows below before upgrading.

  What changes:

  - An interaction adopts the item's value for its response when that value changes to something other than what the interaction last published. A score or timer updating, or the candidate's own answer coming back, does not rewrite it. An interaction that registers after the variables were set now picks them up, and an unanswered item no longer overwrites a `response` attribute on the interaction.
  - `QtiFeedback` decides its own `showStatus` from the item context. `checkShowFeedback()` stays public. The `qti-register-feedback` event is no longer sent. Nothing in this repo or in the host code we looked at listened to it, but a listener would now hear nothing.
  - Feedback is only decided when its outcome changed or an attempt was made. The one visible difference: restoring variables equal to the declared defaults, on an item with no attempt yet, no longer switches on a `show-hide="hide"` modal feedback (it used to open on a restore of nothing). Block and inline feedback decide when they connect and are unchanged. A custom feedback that extends `QtiFeedback` directly behaves like the modal.
  - `readonly` on `qti-assessment-item` is published in the item context (`ItemContext.readonly`) and the interactions follow it. A `readonly` attribute present from the start now applies; before, only a change after the first render did.

  To check in a host:

  - Review or replay screens that assign `item.variables` or `item.responses` and read the interactions right after.
  - Code that sets an outcome and reads or patches the feedback straight after, including observers on the feedback's DOM.
  - Custom interactions whose `response` setter is not safe to call again with the same value. The base class calls it when the item's value changes and the interaction did not publish that value itself.
  - Custom feedback that reached into `QtiFeedback`'s private `_context`. It is now a read-only getter.

- [#229](https://github.com/Citolab/qti-components/pull/229) [`c5d80aa`](https://github.com/Citolab/qti-components/commit/c5d80aa2a5e2e1e09853931cc758a3677ed42593) Thanks [@herrKlein](https://github.com/herrKlein)! - `disabled` on `qti-assessment-item` is now published in the item context (`ItemContext.disabled`) and the interactions follow it, the same way they already follow `readonly`. The item no longer sets it on each registered interaction. Setting `item.disabled` still locks and unlocks the interactions.

  What changes:

  - A `disabled` attribute present on the item from the start now applies. Before, only a change after the first render did.
  - An interaction that was authored `disabled` stays so inside an item that does not mention `disabled`. The item only touches it when `item.disabled` is set.
  - An interaction that registers after the item was disabled now comes up disabled.

  Covered by this repo's stories; not run against a host application. Hosts that lock submitted items by setting `item.disabled` (Kennisnet) should check that flow.

- [#231](https://github.com/Citolab/qti-components/pull/231) [`7786381`](https://github.com/Citolab/qti-components/commit/7786381f03a20ab5a28d86dedbbeae34e50aaac9) Thanks [@herrKlein](https://github.com/herrKlein)! - Items publish whether their interactions are valid, as `ItemContext.valid`, and the test reads it from there instead of asking every loaded item to validate on each update. The item checks when an answer changes, when it connects, and after answers are handed in through `variables`. `qti-assessment-item` also exposes a read-only `itemContext` (the whole context, declarations included), which the test used to reach for as a private field.

  This fixes a bug: after a restore (`qtiTest.state`) or after coming back to an answered item, `ComputedItem.valid` stayed `false` until some later update, because it was read before the answer was adopted. In a section with `allow-skipping="false"` that kept `test-end-attempt` disabled on an item that was already answered.

  What to check in a host:

  - Components that read `ComputedItem.valid` from `computedContext`: it now settles after a restore and after navigating back.
  - `test-end-attempt` in sections that do not allow skipping.
  - Inline validation messages. Read from the code, not observed: `validate()` on an interaction can update its inline message, and the test used to call it on every update of the test. It is now called when the item's answers change.

  Covered by this repo's stories; not run against a host application. Host migration: [PeilingLezen](plans/host-migration/peilinglezen.md), the only surveyed host that consumes `computedContext`.

### Patch Changes

- [#253](https://github.com/Citolab/qti-components/pull/253) [`614c666`](https://github.com/Citolab/qti-components/commit/614c666eb28117e9dd8d432c00465793704448a2) Thanks [@herrKlein](https://github.com/herrKlein)! - A shared stimulus is placed as its whole `qti-assessment-stimulus` instead of only its `qti-stimulus-body`, so the content inherits the stimulus' `xml:lang` and text-to-speech and screen readers read it in the right language. The new `qti-assessment-stimulus` element generates no box (`display: contents`), so layout is unchanged. It drops the stimulus' QTI `title` when placed, which would otherwise show as a tooltip over the whole passage.

- [#226](https://github.com/Citolab/qti-components/pull/226) [`9e52bb7`](https://github.com/Citolab/qti-components/commit/9e52bb7720ab9b47895e57fd80410486bacf29b1) Thanks [@herrKlein](https://github.com/herrKlein)! - Keep restored template values. An item handed template values through `variables` — when it is revisited in a test, or a session is resumed — no longer draws new ones in template processing, so the candidate sees the question they answered. Template processing still runs, so correct responses are derived from the restored values, and values restored after processing re-derive them. Values restored before a template declaration has registered are kept too.

  ## Migration for hosts

  No API change. A behaviour change for hosts that resume sessions: an item revisited or restored with template values now shows those values instead of drawing new ones. A host that relied on a fresh draw on every visit must clear the item's template values before restoring. Hosts that restore through `qtiTest.state` (or `testContext`) need no change: **Kennisnet**, **CitoTestUit** and **PeilingLezen** all benefit without code changes.

- Updated dependencies [[`b0f1c6d`](https://github.com/Citolab/qti-components/commit/b0f1c6d4cc885d361247ac41973874659f6494e0), [`c5d80aa`](https://github.com/Citolab/qti-components/commit/c5d80aa2a5e2e1e09853931cc758a3677ed42593), [`7786381`](https://github.com/Citolab/qti-components/commit/7786381f03a20ab5a28d86dedbbeae34e50aaac9), [`6e87e20`](https://github.com/Citolab/qti-components/commit/6e87e20ddb86495c08d3469fdb6e6de61675c108), [`0fe97cf`](https://github.com/Citolab/qti-components/commit/0fe97cf00fa96710ce38754c05282b1eb03ef53d), [`c572724`](https://github.com/Citolab/qti-components/commit/c572724b9f2a57cabac632354b49f6caf8911533)]:
  - @qti-components/base@2.4.0

## 1.8.0

### Minor Changes

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Support `<qti-custom-operator definition="…">`, the way items authored against the Citolab QTI
  scoring engine name a custom operator. Until now only `class="js.org"` was understood — inline
  JavaScript out of a CDATA section — so an item carrying a `definition` fell through to that path
  with no code to run and contributed nothing to its score.

  `definition` is matched whole, prefix included, against operators the host registers with
  `registerCustomOperator` from `@qti-components/base`. The three the scoring engine ships are built
  in — `Trim`, `ToAscii` (decomposes and drops combining marks) and `ParseCommaDecimal` (the first
  comma becomes a dot) — each under the `depcp:`, `questify:` and `qade:` prefixes. Registering a key
  a built-in already uses overrides it, which is how a delivery engine replaces one it disagrees with.
  An operator is handed the calculated values of the element's child expressions in document order and
  returns the value of the expression. A `definition` nothing provides is NULL rather than an error, so
  the surrounding expression can test it with `qti-is-null`.

  The two mechanisms do not interact and `class="js.org"` is unchanged; `definition` is checked first.

  One fix came with it. `QtiExpression.getVariables()` had no case for `qti-custom-operator`, and
  since that element is not a `QtiExpression` — it has `calculate` but no `getResult` — the default
  branch threw on it, logged "default not sufficient" and yielded null. A custom operator nested in
  another expression therefore handed its parent nothing, which is the shape nearly every real use
  has (`<qti-match><qti-custom-operator …/>…`). It now contributes its value, with the base type read
  off that value rather than declared.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - **Interpolation tables now match on ranges, which changes existing scores.** An entry's
  `source-value` is the lower bound of a range, not a value to match exactly, and `include-boundary`
  (default `true`) says whether the bound itself is in range. Entries are tested in document order and
  the first one the value clears wins.

  We matched exactly and ignored `include-boundary` entirely, so a value between two entries found
  nothing and scored 0. Read this one before upgrading: a table in this repo's own fixture
  (`3 -> 2`, `2 -> 1`, `1 -> 0`, `0 -> 0`, every entry `include-boundary="false"`) now scores a raw 3 as
  1 where it used to be 2, and a raw 2 as 0 where it used to be 1. If your tables were authored
  against the old exact matching, their scores move. This also diverges deliberately from the Citolab
  scoring engine, which documents exact matching rather than ranges.

  `OutcomeVariable.interpolationTable` changes type with it, from `Map<number, number>` to an ordered
  `InterpolationTableEntry[]` — a Map keyed by source value cannot express a bound, a boundary rule or
  document order.

  `qti-lookup-outcome-value` returns `null` rather than `0` when nothing matches, and leaves the
  outcome at the default its declaration gave it instead of writing a score the table never specified.
  It never wrote on a miss before either; only the return value changed.

  **`qti-equal` supports `tolerance-mode="absolute"` and `"relative"`.** Both previously logged
  "toleranceMode is not supported yet" and returned false whatever the values, so a tolerant
  comparison could never succeed. `tolerance` takes one or two numbers (one means both sides);
  `absolute` reads them as offsets around the second expression, `relative` as percentages of it.
  `include-lower-bound` and `include-upper-bound` default to true and are read off the attribute
  rather than declared as Lit boolean properties, because QTI writes `include-lower-bound="false"` and
  Lit's boolean converter takes the mere presence of an attribute as true.

  **`qti-exit-test`** ends a test's outcome processing, the counterpart of `qti-exit-response` and
  caught the same way in `QtiOutcomeProcessingProcessor`.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Implement the four expressions and rules the scoring engine supports and we had no element for at
  all. Each was previously an unknown tag: inert, silently contributing nothing to a score.

  `qti-math-constant` returns `pi` or `e` as a float, and NULL for a name outside that vocabulary.

  `qti-exit-response` ends the attempt's response processing. An exit can sit at any depth — inside a
  `qti-response-condition` branch, inside a `qti-response-processing-fragment` — and has to stop every
  rule after it, not just its own siblings, so it throws a `QtiExitResponseSignal` that
  `qti-response-processing` catches at the top of the run. Unwinding the stack reaches every one of
  those loops without each having to report upwards. The outcomes set before the exit are kept,
  because a `qti-set-outcome-value` has already dispatched by the time the signal is thrown. Anything
  that is not the signal rethrows, so a genuine error in a rule still surfaces.

  `qti-response-processing-fragment` runs its rules in place, in document order, exactly as if they
  had been written where the fragment sits. A fragment held in a separate file is still not pulled
  in, because `qti-include` is not resolved — only the rules authored inside the element run.

  `qti-number-selected` counts the item references the test selected, narrowed by
  `section-identifier`, `include-category` and `exclude-category`. It counts the item refs in the
  document rather than the entries in the test context, so it is the same set `qti-test-variables`
  aggregates over and it is right before any item has been attempted.

  The last two share how they choose item refs, so that selection moved into one place
  (`internal/item-ref-selection`). `qti-test-variables` gains `section-identifier` from the move —
  it filtered by category but had no way to scope to a section.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Close the gaps between our scoring and the QTI expression vocabulary, found by comparing against
  the Citolab QTI scoring engine's supported-feature list. Four of these silently produced a wrong
  score rather than failing.

  **`qti-test-variables` never aggregated anything.** The test-level expression that sums an
  item variable across the test — the one that computes a test's total — always returned 0, or
  threw. Three faults stacked:

  - It resolved the test element from a `qti-assessment-test-connected` listener on itself, but that
    event bubbles _up_ from the test while the expression sits inside that test's
    `qti-outcome-processing`. The listener never fired. It now walks up with `closest()`.
  - The item-ref query read `qti-asssessment-test qti-assessment-item-ref` — three s's, and a
    descendant selector that would match nothing even spelled right, since it runs _on_ the test
    element. `test-base.ts` already had the correct form.
  - `exclude-category` overwrote the `include-category` result instead of narrowing it, so an item
    passing both attributes was decided by the exclude list alone. Both now apply, and each side
    reads `category` as the space-separated list the spec defines.

  **`weight-identifier` was a no-op.** `QtiAssessmentItemRef.weigths` was an empty `Map` nothing ever
  wrote to: the `<qti-weight>` children in the test document were never read, so every weight fell
  back to 1 and a `value="0"` item still counted. Replaced by a `weights` getter that reads them on
  access — they are not in the DOM at construction time. This repo's own `biologie` test masked it,
  because its zero-weight items are also excluded by category.

  The misspelled `weigths` is gone rather than kept as a deprecated alias. Nothing that worked is
  broken by that: the property only ever handed back an empty Map. An alias was the first attempt,
  but two accessors where one returns the other sends the custom-elements-manifest analyzer's type
  parser circular, failing `pnpm run cem`.

  **`qti-math-operator` `log` returned the natural logarithm.** The QTI vocabulary defines `log` as
  base 10 and `ln` as natural; both called `Math.log`. Any item using `log` scored against the wrong
  curve. Items relying on the old behaviour should move to `ln`, which is unchanged. Also adds
  `secant`/`cosecant`/`cotangent` (and the short `sec`/`csc`/`cot`), `toDegrees` and `toRadians`,
  which had no implementation and fell through to a null.

  **`qti-pattern-match` was unanchored.** `new RegExp(pattern).test(value)` matches a substring, so
  `[0-9]+` accepted `"abc123"`. XML Schema pattern semantics match the whole value; the pattern is
  now wrapped as `^(?:…)$` so a top-level alternation cannot escape the anchors. Compiled with the
  unicode flag first so `\p{L}` category escapes work, falling back without it for patterns that flag
  rejects.

  **`qti-field-value` threw on a missing field.** `qti-is-null` over a `qti-field-value` is the
  specified way to ask whether a record carries a field, which requires a missing one to be an
  ordinary NULL — throwing aborted the whole response-processing run instead. Every failure path is
  now NULL.

  **`qti-integer-modulus` disagreed with `qti-integer-divide` on negatives.** The divide rounds down
  (`Math.floor`) while the modulus used JavaScript's `%`, which truncates toward zero: `-7 divide 3`
  gave `-3` but `-7 modulus 3` gave `-1`, where floored division leaves `2`. The remainder is now
  computed to pair with the divide.

  **`qti-stats-operator` implemented two of six functions.** `median`, `popVariance`,
  `sampleVariance` and `sampleSD` warned and returned null; only `mean` and `popSD` worked. A sample
  statistic over a single observation is NULL rather than a division by zero.

  **`qti-match-table` was not read at all.** `qti-outcome-declaration` parsed only
  `qti-interpolation-table`, so `qti-lookup-outcome-value` against a match table always scored 0.
  Match-table targets keep their authored spelling, since a match table may map onto identifiers or
  strings rather than numbers.

  **`qti-repeat` had no iteration cap.** `number-repeats` may name a variable, so a bad value could
  build an unbounded container and hang the tab. Capped at 1000, matching the scoring engine.

### Patch Changes

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Read two QTI attributes that never reached their properties.

  Lit derives an attribute name by lowercasing the property, so a camelCase property bound to a
  hyphenated QTI attribute has to name it explicitly. Two did not, and the attribute silently never
  arrived — no error, just the default.

  `qti-equal-rounded`'s `rounding-mode` was read as `roundingmode`, so every comparison used the
  `significantFigures` default. An item asking for **3 decimal places got 3 significant figures**: at
  that precision 54.598 and 54.608 are both 54.6, so a wrong answer scored full marks. The existing
  `decimalPlaces` specs did not catch it, because their values round the same under either mode.

  `qti-assessment-item`'s `time-dependent` was read as `timedependent`, so `timeDependent` stayed null
  and an item declaring `time-dependent="true"` still reported false to `test-navigation`, which reads
  it to build the computed item context.

  Found by running a computed-answer item end to end — template processing works out an answer with
  `qti-divide` and `qti-math-operator`, and response processing compares the candidate against it with
  `qti-equal-rounded`. Nothing in the repo exercised that shape before.

- Updated dependencies [[`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54)]:
  - @qti-components/base@2.3.0
  - @qti-components/transformers@1.7.3

## 1.7.0

### Minor Changes

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Gate linear navigation and further attempts on item doneness.

  An item is done once an attempt has ended and either reached the optimal outcome or exhausted its
  `max-attempts`. `test-navigation` computes that centrally and publishes `done` and `optimal` on the
  computed context.

  Optimality is judged from the scored outcome where there is one — `SCORE` having reached `MAXSCORE`,
  which handles partial-credit and `qti-mapping` items correctly — and otherwise from an exact match
  against the declared `qti-correct-response`. Items with neither (essays, info items) count as done
  after one attempt, since there is no optimal value to require.

  It is latched only when `processResponse` ends an attempt: `qti-assessment-item` now flags that
  context update with `responseProcessed`, so a mid-attempt selection never counts. A restored session
  seeds the latch once from the persisted context.

  `test-next` in linear/individual mode gates on `done` in place of "any attempt ended", and
  `test-end-attempt` is additionally disabled once a non-adaptive item's last ended attempt was
  already optimal — there is nothing left to improve.

### Patch Changes

- Updated dependencies [[`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c)]:
  - @qti-components/base@2.2.0

## 1.6.5

### Patch Changes

- [`29ed97e`](https://github.com/Citolab/qti-components/commit/29ed97ef79018aa99d941e7d425ac72fa9100abf) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Substitute response processing templates in the element's own custom element registry.

  `qti-response-processing` with a `template="…/rptemplates/map_response.xml"` attribute replaces its
  children with the built-in rules for that template. It parsed them with
  `document.createRange().createContextualFragment()`, and the fragment parsing algorithm takes its
  registry from the context node — `document`, so the global registry. In a player rendered into a
  shadow root with a scoped registry whose tags are also defined globally, every substituted rule was
  upgraded with the global class instead of the scoped one, so a registry that overrides a rule (what
  `qti-corrections` does) never saw its own element.

  The rules are now parsed through the element's own `innerHTML`, where the context element is the
  `qti-response-processing` itself and its registry — scoped or global — is the one that upgrades
  them. An unrecognised template name also leaves the authored children in place instead of clearing
  them.

- Updated dependencies [[`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9), [`3fab714`](https://github.com/Citolab/qti-components/commit/3fab714904293e58e53c0661792f564d84f76bed)]:
  - @qti-components/base@2.1.0
  - @qti-components/transformers@1.7.2
