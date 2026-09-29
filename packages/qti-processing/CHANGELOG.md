# @qti-components/processing

## 1.6.0

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

- Updated dependencies [[`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54)]:
  - @qti-components/base@2.3.0

## 1.5.0

### Minor Changes

- [`0822231`](https://github.com/Citolab/qti-components/commit/0822231381b8b4d5d6f98c524e86cf2ef42f12ce) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Implement the `qti-printed-variable` formatting attributes: `format`, `base`, `index`, `power-form`, `field`, `delimiter` and `mapping-indicator`.

  The element rendered its value with `JSON.stringify(value, null, 2)` and declared none of these attributes, so every printed variable came out as JSON: a single value carried its quotes (`"ChoiceA"`, `"1"`), and an ordered or multiple variable printed as a pretty-printed array —

  > Here is a set of numbers: `["-98",\n  "2",\n  "-70",\n  "48"]`

  — instead of a delimited list. That is what made the mc_stat2 example look like it was printing nothing useful ([#134](https://github.com/Citolab/qti-components/issues/134)).

  Now a container prints its values joined by `delimiter` (default `;`), a record prints `name=value` pairs using `mapping-indicator` (default `=`), `index` selects one value of an ordered variable (1-based), `field` selects one field of a record, `base` prints an integer in another number base, `power-form` prints numeric values in exponential form, and `format` applies a printf-style conversion string (`%.2f`, `Score: %d`, flags `-+ 0#`, width, precision, and the conversions `d i u o x X f F e E g G s c`). A NULL variable — absent, null, or an empty container — prints nothing.

  Closes [#202](https://github.com/Citolab/qti-components/issues/202).

## 1.4.1

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

- Updated dependencies [[`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c)]:
  - @qti-components/base@2.2.0

## 1.4.0

### Minor Changes

- [#193](https://github.com/Citolab/qti-components/pull/193) [`7c7619c`](https://github.com/Citolab/qti-components/commit/7c7619c4a9ab8e98ec6ab7e5bfcc5475bc32aa3e) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Add `qti-outcome-condition` with its `qti-outcome-if` / `qti-outcome-else-if` / `qti-outcome-else`
  branches.

  `outcomeCondition` is the QTI 3.0 counterpart of `responseCondition` and the element the spec's
  own feedback examples branch on. Without it, an `outcomeProcessing` block that uses one had no
  element to match and its rules never ran.

  The two conditions are structurally identical — a container that walks its branches in order and
  processes the sub-rules of the first one that applies — so that behaviour now lives in a shared
  `QtiConditionBase` / `QtiConditionIfBase` / `QtiConditionElseBase` family that both the response-
  and outcome- elements extend. `qti-response-condition` and its branches keep their existing
  behaviour.

### Patch Changes

- Updated dependencies [[`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9)]:
  - @qti-components/base@2.1.0
