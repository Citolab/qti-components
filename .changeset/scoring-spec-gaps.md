---
'@qti-components/processing': minor
'@qti-components/elements': minor
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Close the gaps between our scoring and the QTI expression vocabulary, found by comparing against
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
