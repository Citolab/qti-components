# @qti-components/base

## 2.3.0

### Minor Changes

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Complete `qti-contains`, and with it fix how every operator compares a directed pair.

  `qti-contains` carried its own `TODO: implement this for other types than directedPair`. Two things
  were wrong, and both changed scores:

  - **It tested intersection, not containment.** For `multiple` cardinality the check was
    `intersection.length > 0`, so one shared value was enough: `[A,B]` "contained" `[A,C]`. The spec
    wants every value of the second container present in the first, multiplicity included. Ordered
    containers were not handled at all; they now need the second to appear as a contiguous
    sub-sequence, so `[A,B,C]` contains `[B,C]` but not `[C,A]` or `[A,C]`.
  - **Only `directedPair` worked.** Every other base type hit an `unsupported baseType` error and
    returned false. All base types work now, compared the way `ScoringHelper` compares them.

  A first sub-expression of single cardinality is not what the spec describes — it wants two
  containers — but items in the wild write that and mean `qti-member`. That shape keeps working, with
  a warning, rather than silently scoring 0.

  **`directedPair` comparison ignored direction.** `ScoringHelper.compareSingleValues` sorted both
  operands the moment it split them, which made the `baseType === 'pair'` sort below it dead code and
  every directed pair order-insensitive: a candidate who matched the right two identifiers the wrong
  way round scored as correct. Only `pair` is unordered; a `directedPair` is now compared as written.

  This reaches every operator that compares values — `qti-match`, `qti-equal`, `qti-member`,
  `qti-contains` — so gap-match, associate and order interactions all score directed pairs correctly
  now. Nothing in the test or story suites depended on the old leniency, but authored items that did
  will score differently. `compareSingleValues` gained a spec of its own, since a mistake in it is a
  mistake in all of those operators at once.

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

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Stop every expression element re-rendering on every context change.

  `QtiExpression` rendered `<pre>${JSON.stringify(this.result, null, 2)}</pre>` beside its slot — a
  development aid nobody could see, because expressions live inside `qti-response-processing`, which is
  `display: none`. Worse, it re-ran constantly: `@consume` subscribes through `ContextConsumer`, which
  calls `host.requestUpdate()` itself on every context change, "in case this value is used in a
  template". Here it was not, and dropping `@state()` from the consumed properties does nothing about
  it — the subscription drives the update, not the decorator.

  Measured on an item with 30 response-processing rules, which holds 180 expression elements: 50 test
  context updates produced **9000 renders** — one per element per update — each serialising its result.
  The test context changes on every keystroke in a text entry.

  The template is constant, so the elements now render once and never again, and `result` is no longer
  `@state()` (nothing renders it, and response processing writes it on every expression of every rule
  it walks). The same 50 updates now produce **0 renders**, and the loop went from 10ms to 3ms. The
  context subscriptions stay: `calculate()` reads the current values when a rule invokes it.

  Replacing the debug `<pre>`, `QtiExpression` exposes a public `lastResult` — what the last
  `calculate()` produced. That is the supported way to inspect a scoring run: process the responses,
  then walk the rule tree reading `lastResult` off each expression to get the whole tree annotated with
  its values. It costs nothing when unused, and gives a tool more than the `<pre>` ever did, which was
  one hidden element's JSON.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - **Expression results no longer claim to be integers, which changes comparisons.** Elements reached
  through `QtiExpression.getVariables` that declare no base type — every operator without a case of its
  own, and `qti-custom-operator` — were all labelled `integer`. `ScoringHelper.compareSingleValues`
  parses an integer with `parseInt`, so every non-integer result was truncated before it was compared:

  ```
  equal( divide(5, 2), 2.4 )   was true    // 2.5 and 2.4 both truncated to 2
  ```

  The base type is now read off the value: a whole number is `integer`, a fractional one `float`, a
  boolean `boolean`, anything else text. Items comparing the result of a `qti-divide`, `qti-product`,
  `qti-math-operator` or similar against a decimal will score differently — correctly — where they used
  to match on the truncated integer.

  **A NULL result is now an operand rather than a gap.** An expression evaluating to NULL was handled
  inconsistently: the old default branch kept it as a variable with a null value, while newer cases
  returned nothing and the operand was filtered out of the list entirely. Dropping it both hides the
  NULL from `qti-is-null` and shifts every operand after it, so a binary operator with a NULL first
  argument silently reads its second as its first. Every path now yields a variable whose value is
  null.

  **`qti-correct` naming an undeclared response no longer crashes the run.** It found the variable,
  deliberately defaulted it to null, and then dereferenced that null — `Cannot read properties of null
(reading 'baseType')` — taking down the whole response processing. A typo in an `identifier`, or an
  expression evaluated before its declaration registered, was enough. It is an unresolved variable, so
  it is NULL.

  `qti-is-null` gained a related fix: its `if (!variables)` guard never fired, because an empty array
  is truthy, and the read after it threw. An operand that resolves to nothing is now NULL.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Let an operator declare the base type its result always has, instead of guessing it from the value.

  The QTI vocabulary fixes the result type of some operators regardless of their operands:
  `qti-divide` is a float even when it divides two integers exactly, `qti-round` an integer whatever it
  rounds. Reading the type off the computed value cannot know that — `divide(8, 2)` is `4`, which looks
  like an integer — and `compareSingleValues` parses an integer with `parseInt`, so the other operand
  was compared with its fraction discarded:

  ```
  equal( divide(8, 2), 2.5 )   was true
  ```

  `QtiExpression` gains a `resultBaseType` that operators override. Declared as `float`:
  `qti-divide`, `qti-power`, `qti-math-constant`, `qti-stats-operator`, `qti-integer-to-float`,
  `qti-round-to`, and `qti-math-operator` for everything but `floor`, `ceil` and `signum`. Declared as
  `integer`: `qti-integer-divide`, `qti-integer-modulus`, `qti-round`, `qti-truncate`,
  `qti-container-size`, and those three `qti-math-operator` functions. Operators whose type follows
  their operands — a `qti-sum` of integers is an integer — declare nothing and are still read off the
  value.

  This is the root-cause half of the earlier `baseType: 'integer'` change, which stopped every result
  being labelled an integer but still inferred from the value.

  Alongside it, an integer comparison no longer truncates a fractional operand. `parseInt` reads "2"
  and "2.5" as the same number, so a response genuinely declared `base-type="integer"` matched a
  candidate's "4.5" against a correct "4". When either side has a fractional part the two are not the
  same number and are compared in full; two whole values still go through `parseInt`, keeping its
  tolerance of input like "12 euro".

  Covered end to end by a new item fixture, because no item in this repo computes with `qti-divide` or
  `qti-math-operator` — 0 of 295 — so nothing exercised numeric comparison through real response
  processing.

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

- [#215](https://github.com/Citolab/qti-components/pull/215) [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54) Thanks [@BrianCitolab](https://github.com/BrianCitolab)! - Support `shape="default"` area map entries, which neither render nor score.

  A `default` area is the whole image. QTI 3.0 §7.9 ends its coords list with "default: no
  coordinates should be given", but the XSD makes `coords` `use="required"`, so real items carry
  filler — `0,0,100%,100%` in Citolab/qti-components#83. Both places that read an area treated that
  filler as geometry:

  `positionShapes` knew `circle`, `rect`, `ellipse` and `poly`, so a `default` entry fell to its
  `default:` branch, logged `Unsupported shape: default` and wrote no styles at all — showing the
  correct response left the area in the DOM with no size, invisible. It now spans the image, and the
  coords are deliberately not read: HTML, where the vocabulary comes from, settles it with "This area
  is the whole image. (The coords attribute is not used.)"

  `ScoringHelper.isPointInArea` had a `case 'default'` folded in with `case 'circle'`, which demands
  exactly three coords, so it rejected every real entry as an `Invalid circle definition` and a click
  outside the other areas scored nothing. `default` now returns true for any point without reading
  coords.

  A whole-image area overlaps every other area, which made a missing `break` in
  `qti-map-response-point` reachable for the first time: a point inside a smaller area scored that
  area _and_ the catch-all. §7.4 — "each area is tested in turn, with those listed first taking
  priority in the case where areas overlap and a point falls in the intersection" — so matching now
  stops at the first area containing the point.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Stop doing expensive work for log lines nobody reads, and log at the right level.

  Two traces serialised data on every expression evaluation, whether or not anything was listening —
  `console.debug` computes its arguments regardless of the console's level:

  - `qti-multiple` logged `this.innerHTML`, serialising its whole DOM subtree. It wraps the correct
    response in most choice items, so this ran on every scoring pass.
  - `qti-default` logged `JSON.stringify(itemContext)`, serialising an item's entire variable set —
    and did it _before_ the null check that may return early.

  Two more fired per child per expression evaluation in `QtiExpression.getVariables` and carried no
  information the caller did not already have. All four are gone; no debug infrastructure gated them,
  so they were development traces rather than diagnostics anyone could rely on.

  Error conditions in `qti-lte` and `qti-gte` were reported with `console.log` rather than
  `console.error` (and `qti-gte` named itself "qte"), and the `disableAfterIfMaxChoicesReached`
  deprecation notice used `console.log` where a deprecation belongs at `console.warn`. No
  `console.log` remains in shipped source.

- [#215](https://github.com/Citolab/qti-components/pull/215) [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54) Thanks [@BrianCitolab](https://github.com/BrianCitolab)! - Stop mangling fractional outcome values on comma-decimal locales.

  `convertNumberToUniversalFormat` ran `.replace('.', '')` over `Number.prototype.toString()`, which
  always uses `.` regardless of locale. On any browser whose locale uses a decimal comma (nl, de, fr,
  ...) that deleted the separator instead of converting it: a score of `0.5` was stored as `"05"` and
  `1.5` as `"15"`, so every SCORE with a fraction came out ten times too big. On dot-decimal locales
  the other branch called `toLocaleString()`, which grouped thousands — `1234.5` became `"1,234.5"`.

  Both branches are gone. `toString()` already produces QTI's format — a plain decimal with `.` and no
  grouping — on every locale. Affects `qti-set-outcome-value`, `qti-lookup-outcome-value`,
  `qti-set-template-value` and `qti-set-correct-response`.

## 2.2.0

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

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Add `qti-item-session-control`, and honour `max-attempts` and `allow-skipping`.

  The element exposes the QTI 3.0 `ItemSessionControl` attributes, and `test-navigation` cascades
  them from test-part to section to item into the computed context, so every item carries the
  settings that apply to it.

  `test-end-attempt` reads that cascade: it is disabled once a non-adaptive item has reached its
  `max-attempts` (`max-attempts="0"` means unlimited), and — when `allow-skipping` is false — while
  the active item's response is still invalid or untouched. Adaptive items are exempt from the
  attempt limit, since they are meant to keep iterating.

  The computed context gains `valid` and `isDefaultResponse` per item to support that, alongside
  `maxAttempts` and `allowSkipping`.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Apply the `show-feedback` constraint per the QTI `ItemSessionControl` rules.

  `test-navigation` cascades `show-feedback` from the session control into the computed context, and
  `QtiFeedback` consults it.

  The constraint governs exactly one state: after the end of the last attempt. Until then the spec
  requires any applicable feedback to be shown — "a value of max-attempts greater than 1, by
  definition, indicates that any applicable feedback must be shown" — and only "once the maximum
  number of allowed attempts have been used (or for adaptive items, completionStatus has been set to
  completed)" does `show-feedback` decide. So the gate asks whether the item is out of attempts, which
  is answered per item kind:

  - adaptive items ignore `max-attempts` entirely, and are out of attempts only once
    `completionStatus` is `completed`;
  - `max-attempts="0"` means no limit, so that state is never reached and feedback always shows;
  - otherwise, once `numAttempts` reaches `max-attempts`, `show-feedback` decides, defaulting to
    false.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Reveal the solution after an ended attempt when `show-solution` says so.

  `test-navigation` settles item doneness on an ended attempt and hands it to a new
  `afterAttemptEnded` extension point, alongside the item and its computed-context entry. The hook is
  needed because the computed context only catches up on the next update, after the event has finished
  bubbling.

  `TestNavigationCorrection` overrides it for the standard `qti-item-session-control show-solution`:
  an ended attempt marks the candidate's selection, and a done item also reveals the correct answer.
  The player takes no opinion of its own — whether marks accumulate across attempts belongs to the
  corrections rendering, not to item session control.

### Patch Changes

- [#198](https://github.com/Citolab/qti-components/pull/198) [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Resolve test-level outcomes in variable expressions.

  The `variable` expression and `getVariables()` only consulted item scope, so a test-level outcome
  that had just been set — a total summed in outcome processing, say — could not be read back:
  `<qti-variable identifier="TEST_SCORE"/>` resolved to `undefined` and threw once used in a
  comparison.

  Item scope is resolved first, then the test-level outcome variables, mirroring how
  `qti-printed-variable` already does it — and an unresolved identifier now returns `null` instead of
  throwing. This is the pattern the QTI 3.0 spec's own feedback examples rely on: set a total via
  `qti-test-variables`, then branch on it with `qti-variable` in an `outcomeCondition`.

## 2.1.0

### Minor Changes

- [#190](https://github.com/Citolab/qti-components/pull/190) [`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Keep interactions working where custom states are unsupported.

  Interactions track selection and correct/incorrect marking through `internals.states`, with bare
  state names (`checked`, `radio`, `correct-response`, …). Two browser profiles cannot service that,
  and on both, picking a choice throws rather than registering:

  - Safari 16.4–17.3 implement `ElementInternals` but not `CustomStateSet`, so `internals.states` is
    `undefined` and reading it throws.
  - Chrome and Edge before the CSS custom-state spec change expose `states` but reject names that do
    not start with `--`, so `states.add('radio')` throws a `SyntaxError`.

  `attachInternals` is unguarded throughout the interaction base classes, which puts the hard support
  floor at Safari 16.4 — inside the range that breaks.

  `@qti-components/base` now classifies custom-state support by behaviour — `missing`, `legacy` or
  `modern`, probing a throwaway element rather than sniffing versions — and on the first two replaces
  `states` with a permissive `Set` that also mirrors its contents to a space-separated `data-state`
  attribute on the host. Where `states` works natively nothing is installed and nothing changes.

  The mirror is needed because these browsers' CSS parsers also drop any selector list containing
  `:state()`, so checked, correct-response and drag styling never rendered there either. The theme's
  built stylesheets now pair every `:state(x)` with a `[data-state~='x']` arm, applied at build time by
  `tools/postcss/custom-state-fallback.mjs`. `:is()` is what makes the pairing work in both
  directions: its forgiving parsing means a browser that does not understand `:state()` keeps the
  attribute arm, while a browser that does keeps matching the state arm.

## 2.0.1

### Patch Changes

- [`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make the published types usable from outside the workspace, and stop shipping a second copy of Lit.

  - **qti-components**: stop bundling Lit into the npm build. `noExternal` included `lit`, while `package.json` also declared it a dependency, so a consumer received the bundled copy _and_ installed one — and anything with its own Lit components ran two. Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them), two `@lit/context` registries, and lit's "Multiple versions of Lit loaded" warning, which counts registered instances rather than comparing versions. `lit`, `lit-html`, `lit-element` and `@lit/*` are now external for the npm build; the CDN builds still bundle everything, as they must.
  - **qti-components**: emit self-contained declarations. `dts: { resolve: true }` only inlines types behind bare specifiers, so the ~20 deep subpath imports of `@qti-components/*` — devDependencies, deliberately not published — stayed in the output. The runtime worked while the types were unresolvable, and consumers had to install those devDependencies by hand to type-check at all. The declaration build now resolves each specifier to the sibling package's built `.d.ts`; nothing but real runtime dependencies (`lit`, `@heximal/templates`) is left external.
  - **qti-components**: accept a React ref. The generated JSX types declared `ref` as the element or a callback taking it, which is right for a Lit template and wrong for React — and unfixable downstream, since the generator emits both `declare module "react"` and `declare global`, so a consumer's augmentation merges rather than replaces. `ref` now also accepts a `RefObject`.
  - **qti-item**, **qti-test**: type `itemURL` / `itemDoc` / `itemXML` and `testURL` / `testDoc` / `testXML` as `| null`. All six initialise to `null` while declaring a non-null type, which compiled only because the workspace builds without `strictNullChecks`. Consumers on `strict` were unable to pass the `null` these properties already hold — note that they now have to handle it.
  - **base**, **interactions-core**, **inline-choice-interaction**: take `PropertyValues` rather than `PropertyValues<this>` in `firstUpdated`, `willUpdate` and `updated`. The polymorphic `this` narrowed the parameter per subclass, which made every interaction structurally incompatible with `LitElement` — so `Constructor<LitElement>`, the standard constraint for a Lit mixin, rejected all of them and a consumer could not wrap an interaction in a mixin without casting.
  - **qti-test**: describe what `TestNavigationMixin` actually adds. Its interface placeholder was an empty `declare class`, so the returned `Constructor<…> & T` contributed nothing and `navigate`, `requestTimeout`, `postLoadTransformCallback`, `postLoadTestTransformCallback` and `navigateTo` were all erased from `QtiTest`'s public type — consumers had to intersect the class with `IQtiTest` by hand to describe one element. `ITestNavigationMixin` now carries them, plus the previously undeclared `getLoadingProgress`, and the mixin class `implements` it so the two cannot drift apart.
  - **qti-test**: drop `showLoadingIndicators` and `retryNavigation` from `ITestNavigationMixin`, and so from `IQtiTest`. Nothing implemented either — they existed only in the interface, and `retryNavigation()` would have thrown. No runtime behaviour changes, but code that referenced them in a type position will no longer compile.
