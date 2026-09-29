# @citolab/qti-components

## 9.2.0

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

- [#217](https://github.com/Citolab/qti-components/pull/217) [`89727fa`](https://github.com/Citolab/qti-components/commit/89727fa0f9113fbd68ef46bf06a3c8839367c205) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Add `view` to `<qti-item>`, so view-tagged content — a scorer's `qti-rubric-block` above all — can be shown on an item delivered outside a test.

  QTI tags content with the audience it is for, and `item.css` hides every `[view]` element until something marks it `.show`. Only `TestViewMixin` ever did, off `sessionContext.view`. An item delivered on its own has no session, and nothing at item level did it either: `packages/qti-item` contained no occurrence of `view` at all. So the hide shipped in the _item_ stylesheet without its matching show, and a `qti-rubric-block view="scorer"` in a standalone item could not be displayed by any public API — the marker saw the question and nothing to mark against.

  The asymmetry was visible in this repo's own layout. `qti-corrections` has an item-level counterpart for every test-level correction control (`item-show-correct-response`, `item-show-candidate-correction`, `item-correct-response-mode`), but nothing matching `test-view`. And the Kennisnet VRT stories author `qti-rubric-block view="scorer"` into bare `qti-item-body` fragments with no test in the tree, where those blocks can never render.

  `ItemViewMixin` closes it, as the item-level twin of `TestViewMixin`:

  ```html
  <qti-item view="scorer">
    <item-container item-url="./path/to/item.xml"></item-container>
  </qti-item>
  ```

  It resolves the view on every change and whenever an item connects, toggling `.show` on `[view]` content inside the item, and accepts an `item-switch-view` event so a child control can drive it. A plain property rather than a session context: a session is precisely what a standalone item does not have.

  `QtiItemCorrection` pairs `scorer` with the answer key through the mixin's `updateAssessmentItemView` hook, which is byte-for-byte what `QtiTestCorrection` already does inside a test — so a marker switching view gets the rubric and the key together instead of asking for them separately. Without `@qti-components/corrections` loaded the mixin reveals the rubric and paints nothing else.

  One theme change comes with it: the structural rule is now `[view]:not(qti-item)`. `view` on content marks who it is for, but on the host it says which audience to resolve, and without the exclusion `<qti-item view="scorer">` would hide the item it configures wherever the sheet reaches the host — which it does in a shadow root that adopts `item.css` above `qti-item` rather than inside `item-container`. Both rules moved up one specificity point together, so their order relative to each other is unchanged.

  There is no item-level equivalent of `<test-view>` or `<test-view-toggle>` yet; `item-switch-view` is the hook for one.

- [#219](https://github.com/Citolab/qti-components/pull/219) [`aee42e6`](https://github.com/Citolab/qti-components/commit/aee42e664e5c2dce5630cce0493118bff8655e7c) Thanks [@herrKlein](https://github.com/herrKlein)! - Finish the `<template item-ref>` hook on `qti-assessment-item-ref`.

  The element has carried a `myTemplate` property and a `render()` that branches on it since the
  stamp components were written, but the one line that resolves the template was commented out, so
  `myTemplate` was never assigned and the branch was dead. A host that wanted to put its own chrome
  around every item — a bookmark, an index number, a score badge — had no seam at all, and the only
  way in was to replace the registered element.

  Put a `<template item-ref>` in the light DOM of your `<qti-test>` and every item-ref in the test
  renders with it:

  ```html
  <qti-test>
    <template item-ref>
      <div class="badge">{{ identifier }}</div>
      {{ xmlDoc }}
    </template>
    …
  </qti-test>
  ```

  The template is the whole render, so it places `{{ xmlDoc }}` itself; leaving it out renders the
  chrome and no item. Without a template the element renders the item exactly as before, so this is
  additive — nothing that works today changes.

  The model is `ItemRefTemplateModel`: `xmlDoc`, `identifier`, `href`, `category`, and `itemRef` as
  the escape hatch for a template that needs a handler or a host value, reached through a property on
  the element.

  Two fixes to the commented code it replaces. The lookup assumed the ref always sits directly inside
  a shadow root (`getRootNode().host.closest('qti-test')`), which throws for a ref in plain light DOM
  and for one nested deeper than one root; it now climbs root by root and gives up quietly when there
  is no enclosing `<qti-test>`. And `myTemplate` was declared as an always-assigned
  `TemplateFunction`, which it never was — it is now `TemplateFunction | null`, matching
  `test-scoring-buttons`.

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

- [#214](https://github.com/Citolab/qti-components/pull/214) [`f08846d`](https://github.com/Citolab/qti-components/commit/f08846d28d4df75bcce80ea443b3c2662f4a7d9b) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix a dropped picture rendering low and hanging out of its hotspot in `qti-graphic-gap-match-interaction` ([#213](https://github.com/Citolab/qti-components/issues/213)).

  `qti-gap-img` never called `super.connectedCallback()`, so Lit never enabled updating and the element had no shadow root — which made `qti-gap-img.styles.ts`, the stylesheet that centres the picture, dead code. The source already carried a note saying exactly that. Without it the authored `<img>` / `<object>` was laid out as an inline replaced element on a text baseline rather than centred: it sat low in the chip with the line box's descender space below it.

  On the 1EdTech "Airport Tags" example, whose hotspot `A` is authored `coords="12,108,39,121"` (27x13) around an 18x9 picture, the picture rendered 7px down from the hotspot top, 2.5px below its centre, with its bottom 3px past the box. The chip also measured 18px tall for a 9px picture, and that measurement feeds `--qti-dropzone-min-height` — so the hotspot itself was inflated to 27x18 and the box on screen was not the box in the item either.

  `qti-gap-img` now calls `super.connectedCallback()` and renders a `<slot part="label">`, matching `qti-gap-text`, the sibling chip that always did this correctly. The chip is the size of its picture, the hotspot keeps the size its `coords` declare, and the picture lands centred inside it.

- [#212](https://github.com/Citolab/qti-components/pull/212) [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix `qti-graphic-order-interaction` on the QTI 3 spec form of an ordering item ([#209](https://github.com/Citolab/qti-components/issues/209)). Two defects, either of which broke it on its own.

  **RESPONSE ignored the candidate's ordering.** The interaction only wrote `aria-ordervalue` on each hotspot; the response itself was published by `ChoicesMixin` as the set of _checked_ choices in **DOM order** — the one thing an ordering must not do. `ChoicesMixin.maxChoices` also defaults to `1`, so each click cleared the previous hotspot and made the interaction a `radiogroup` of `radio`s. Clicking A, D, C, B left `RESPONSE` as the single identifier `"B"` where the `ordered` cardinality declaration expects `["A","D","C","B"]`, so response processing never scored the item — while the pins painted 1-2-3-4 and made it look right.

  The response is now the ordering: `max-choices` defaults to `0` (no limit, QTI's default for an ordering), the interaction publishes the ordered identifier list itself, and pins plus `aria-ordervalue` are derived from the response rather than kept as a second copy of it. Deselecting a hotspot renumbers the rest by falling out of the array, and a response set from anywhere else — a restored attempt, a correct-response display, an author setting the property — now repaints the pins.

  **An `<object>` graphic left every hotspot unpositioned.** QTI 3 carries the graphic as `<object type="image/png" data="…">`, which is what the spec's own graphic interaction examples use, but the hotspots were positioned against `querySelector('img')`. On a spec-form item that is `null`, `positionShapes` threw, and no hotspot got a position — so all of them collapsed onto the theme's `100%x100%` and stacked as one large box below the graphic. Only items that had been through a converter rendered at all.

  `findGraphic` now accepts `<img>` and `<object type="image/*">` alike, and `positionShapes` resolves the coordinate space from either — including the two forms where the attributes cannot supply it. `width`/`height` are **optional** on the QTI `<object>` (only `data` and `type` are required), so a graphic that declares no size falls back to the bitmap's own, probed by loading the same URL and cached per element. And QTI's `LengthDType` is `[0-9]+%?`, so `width="50%"` is valid markup on either form: a percentage is a layout instruction, not a coordinate space, and reading it as `50px` used to push every hotspot off the graphic — it now falls back to the intrinsic size too. A graphic whose size cannot be resolved at all is reported instead of silently writing `NaN%` and leaving the hotspots full-size.

  `qti-hotspot-interaction`, `qti-graphic-associate-interaction` and `qti-select-point-interaction` make the same `img`-only assumption and are not covered here.

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

- [#212](https://github.com/Citolab/qti-components/pull/212) [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Report a malformed item instead of rendering the browser's XML parse error as the item ([#211](https://github.com/Citolab/qti-components/issues/211)).

  `DOMParser.parseFromString(text, 'text/xml')` never throws: on a malformed document it returns a _document describing the failure_, an HTML page reading "This page contains the following errors…". `parseXML` and `loadXML` handed that straight back, `toHTML` copied it into the DOM node by node, and the player rendered the browser's error page as the item's content — silently, because `item-container` wraps both entry points in a `try`/`catch` that nothing ever reached.

  Both now detect the parser-error document and throw, carrying the parser's own message so the line and column of the real problem survive. The error document is matched by its namespace rather than by tag name, so an item that legitimately contains an element named `parsererror` is not mistaken for a failure.

  Leading whitespace and a BOM before the XML declaration are stripped before parsing. A blank line in front of `<?xml` is fatal to the letter of the XML spec, and it is also one of the most common artefacts of an item that has been through an editor or a copy and paste — the parser already tolerated the analogous BOM case. That is the input that surfaced this: it rendered as `error on line 2 at column 6: Invalid processing instruction: <?xml`.

- [#215](https://github.com/Citolab/qti-components/pull/215) [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54) Thanks [@BrianCitolab](https://github.com/BrianCitolab)! - Stop mangling fractional outcome values on comma-decimal locales.

  `convertNumberToUniversalFormat` ran `.replace('.', '')` over `Number.prototype.toString()`, which
  always uses `.` regardless of locale. On any browser whose locale uses a decimal comma (nl, de, fr,
  ...) that deleted the separator instead of converting it: a score of `0.5` was stored as `"05"` and
  `1.5` as `"15"`, so every SCORE with a fraction came out ten times too big. On dot-decimal locales
  the other branch called `toLocaleString()`, which grouped thousands — `1234.5` became `"1,234.5"`.

  Both branches are gone. `toString()` already produces QTI's format — a plain decimal with `.` and no
  grouping — on every locale. Affects `qti-set-outcome-value`, `qti-lookup-outcome-value`,
  `qti-set-template-value` and `qti-set-correct-response`.

## 9.1.0

### Minor Changes

- [#205](https://github.com/Citolab/qti-components/pull/205) [`8959ee7`](https://github.com/Citolab/qti-components/commit/8959ee7e6417061d80fba5d027900dd7fc42afce) Thanks [@herrKlein](https://github.com/herrKlein)! - Ship the theme sheet as a real module, so `@qti-components/item` and `@qti-components/test` can be
  installed on their own.

  Both packages adopt the theme into their shadow root, so they need the sheet as _text_. They got it
  with `import itemCss from '../../../../qti-theme/src/item.css?inline'` — but `?inline` is
  bundler-only syntax, and `tsc` (how all 32 non-umbrella packages build) copies the specifier through
  verbatim. `@qti-components/item@1.4.3` therefore shipped that exact line. Two things wrong with it:
  the `?inline` suffix no plain bundler resolves, and the path climbs out of the package into a
  sibling directory that `files: ["dist"]` never publishes. Installing the package from npm and
  bundling it fails outright:

  ```
  ✘ [ERROR] Could not resolve "../../../../qti-theme/src/item.css?inline"
      @qti-components/item/dist/components/item-container/item-container.js:15:20
  ```

  It went unnoticed because the umbrella inlines these packages at build time and its esbuild plugin
  resolves the `?inline` right there — inside the workspace, where `dist/` sits at the same depth as
  `src/` and the relative path happens to land on a real file. Consumers of `@citolab/qti-components`
  never saw the broken specifier. Consumers of the granular packages could not get past it.

  `@qti-components/theme` now exposes `./item-css`, an ES module exporting the compiled sheet as a
  string. It is generated from the already-built `dist/item.css` rather than by running PostCSS a
  second time, and the result is byte-for-byte what the inline plugin produced (279,603 chars) — so
  the text these containers adopt is unchanged and nothing renders differently. `item-container` and
  `test-container` import that instead, and `@qti-components/theme` moves to a real `dependency` of
  `@qti-components/item` (it already was one of `@qti-components/test`) so the topological build
  order guarantees it exists first.

  Verified: with the fix, `@qti-components/item` installed from a tarball bundles cleanly and carries
  exactly one copy of the sheet.

  Also in this change:

  - **Every package now cleans before it builds.** None did, so `dist/` accumulated files whose
    sources were deleted — `@qti-components/corrections` was carrying a stale
    `dist/stories/with-correction-registry.decorator.js` from a removed source file, itself
    containing a `?inline` import. Nothing broken had actually shipped from this (the file was
    outside the published tarball), but `publish-if-needed.mjs` runs `--ignore-scripts`, so the
    tarball is whatever happens to be on disk.
  - **An eslint rule** rejects `?inline`/`?raw`/`?url` specifiers in package sources, naming the fix
    in the message. `import/no-relative-packages` had already flagged the original line and was
    silenced with an inline disable; that disable is gone. Exempt: `packages/qti-theme` (owns the
    dev-side source shim), spec/story files and `apps/*` (never compiled into a published dist).
  - The five spec files and two `apps/e2e` stories that loaded the sheet through `?inline` now use
    the same entry point as production, so they exercise the path consumers actually take rather than
    a dev-only one.
  - Removed a dead `@qti-components/theme` mapping in the root `tsconfig.json` pointing at a
    `src/index.ts` that does not exist.

### Patch Changes

- [#206](https://github.com/Citolab/qti-components/pull/206) [`3984227`](https://github.com/Citolab/qti-components/commit/39842270a207dfb43e0cd95a9a63faaaaf6a8989) Thanks [@herrKlein](https://github.com/herrKlein)! - Make `@heximal/templates` a dependency of `@qti-components/test` instead of a peer.

  A peerDependency says "there must be exactly one of these, and you own the choice". Neither half is
  true here: `@heximal/templates` is a templating library used by seven files inside one package, it
  has no singleton requirement, and no consumer has any reason to hold an opinion about its version.
  Peering it just forced every consumer to install a transitive implementation detail by hand.

  That was a real failure, not a theoretical one. Under an install that does not auto-install peers —
  Yarn 2+, or pnpm with `auto-install-peers=false` — the published `@qti-components/test@1.6.1` cannot
  resolve its own import:

  ```
  @heximal/templates  ->  MODULE_NOT_FOUND
  ```

  As a plain dependency it now installs automatically, and the consumer declares nothing.

  `lit` and `@lit/context` stay peers, where the reasoning does hold: two copies of Lit mean two
  `ReactiveElement` base classes, so `instanceof` fails across them, and Lit's own multi-version
  warning fires.

- [#204](https://github.com/Citolab/qti-components/pull/204) [`bea30e9`](https://github.com/Citolab/qti-components/commit/bea30e9c6df3e2e71d14b4deaa6c3de288a6e92d) Thanks [@herrKlein](https://github.com/herrKlein)! - Declare the shared runtime dependencies through a pnpm catalog, so Lit cannot drift out of
  alignment again.

  `lit` was hand-written in 62 places across 34 manifests at two different ranges — `^3.3.1` in every
  `peerDependencies` block, `^3.3.3` in every `devDependencies` block — and `@citolab/qti-components`
  declared `^3.3.3` as a hard `dependency`. A consumer pinned to 3.3.1 or 3.3.2 could satisfy the
  parts and not the umbrella, which is how a package manager ends up installing a second copy of Lit.
  Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them) and two
  `@lit/context` registries; because the contexts in `@qti-components/base` are keyed with a unique
  `Symbol()` rather than `Symbol.for`, every `@consume` then silently never resolves — no error, no
  log.

  `lit`, `@lit/context` and `@heximal/templates` now live in the `catalog:` block of
  `pnpm-workspace.yaml`, and every manifest references them as `"catalog:"`. The peer and dev ranges
  are unified on `^3.3.1`, the wider of the two: it still installs 3.3.3 locally, and narrowing it
  would exclude consumers the sibling packages already accept.

  The only change to a published manifest is `@citolab/qti-components`'s `dependencies.lit`, which
  widens from `^3.3.3` to `^3.3.1` to match its own parts. Every other packed manifest is byte
  identical — `pnpm pack` and `pnpm publish` resolve `catalog:` back to the real range in
  `dependencies`, `devDependencies` and `peerDependencies` alike. No resolved version changes.

  Two pieces of tooling had to move with it, because **npm does not understand the `catalog:`
  protocol and copies the literal string through**:

  - `tools/testing/consumer-types.mjs` now packs with `pnpm pack` instead of `npm pack`, and asserts
    the packed manifest contains no leftover `catalog:` or `workspace:` range.
  - The pkg.pr.new prerelease workflow now passes `--pnpm`. pkg-pr-new shells out to `<pm> pack` and
    that pm defaults to npm, so without the flag every prerelease tarball would have declared
    `"lit": "catalog:"` — not a version range — and failed to install downstream.

  The `storybook` override also moves to the catalog, retiring the deprecated `$storybook`
  version-reference syntax that publint was warning about.

## 9.0.0

### Major Changes

- [#203](https://github.com/Citolab/qti-components/pull/203) [`a5739c6`](https://github.com/Citolab/qti-components/commit/a5739c6327dd3e850081dfd76f6b5923d3fbbfdd) Thanks [@herrKlein](https://github.com/herrKlein)! - `@citolab/qti-components/corrections` is now a drop-in alternative to the package root. Where the root registers the standard delivery elements, this registers the same set with the correction variants substituted for the tags they cover, plus the correction-only controls:

  ```html
  <script type="module">
    import '@citolab/qti-components/corrections';
  </script>
  ```

  Elements without a correction variant — the processing operators, most test controls, interactions like media and upload — still get their standard constructor, so the page works as a whole.

  **Breaking:** that subpath previously only re-exported `@qti-components/corrections` and registered nothing. It still exports everything it did, but importing it now defines custom elements. Anything importing it purely for the mixins, types or constructors should move to the package root.

  Importing `@citolab/qti-components` is unchanged.

  Registration is first-wins and silently so — every `register.ts` guards with `if (!customElements.get(tag))` — so importing both entry points leaves the correction variants inactive with no error. The corrections entry detects that and warns, naming the tags it could not claim.

### Minor Changes

- [`0822231`](https://github.com/Citolab/qti-components/commit/0822231381b8b4d5d6f98c524e86cf2ef42f12ce) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Implement the `qti-printed-variable` formatting attributes: `format`, `base`, `index`, `power-form`, `field`, `delimiter` and `mapping-indicator`.

  The element rendered its value with `JSON.stringify(value, null, 2)` and declared none of these attributes, so every printed variable came out as JSON: a single value carried its quotes (`"ChoiceA"`, `"1"`), and an ordered or multiple variable printed as a pretty-printed array —

  > Here is a set of numbers: `["-98",\n  "2",\n  "-70",\n  "48"]`

  — instead of a delimited list. That is what made the mc_stat2 example look like it was printing nothing useful ([#134](https://github.com/Citolab/qti-components/issues/134)).

  Now a container prints its values joined by `delimiter` (default `;`), a record prints `name=value` pairs using `mapping-indicator` (default `=`), `index` selects one value of an ordered variable (1-based), `field` selects one field of a record, `base` prints an integer in another number base, `power-form` prints numeric values in exponential form, and `format` applies a printf-style conversion string (`%.2f`, `Score: %d`, flags `-+ 0#`, width, precision, and the conversions `d i u o x X f F e E g G s c`). A NULL variable — absent, null, or an empty container — prints nothing.

  Closes [#202](https://github.com/Citolab/qti-components/issues/202).

### Patch Changes

- [#201](https://github.com/Citolab/qti-components/pull/201) [`eac8b80`](https://github.com/Citolab/qti-components/commit/eac8b80db65b08c01314fc5a6fd9630afbae3541) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - No-op `test-navigation`'s candidate events when there is nothing to act on.

  The navigation buttons are clickable before a test document has loaded — a failed
  `assessment.xml` fetch leaves them enabled indefinitely — so a click could reach a handler
  that dereferenced the test element, the item-ref and its assessment item unguarded, throwing
  `TypeError: Cannot read properties of undefined (reading 'querySelector')`.

  `test-end-attempt` now resolves the item through the existing `activeAssessmentItem` getter and
  `test-update-outcome-variable` through `#assessmentItemFor`, each returning early when nothing is
  rendered. Autoscoring resolves the item from the interaction event's own path, so
  `qti-interaction-changed` also returns early for a change raised outside an assessment item.

  `test-show-correct-response` and `test-show-candidate-correction` need no change: they are handled
  by `TestNavigationCorrection` in qti-corrections, which already resolves the item through optional
  chaining.

- [`1252a5b`](https://github.com/Citolab/qti-components/commit/1252a5b0f6c9dc1205101ab9844729c6a9e2918c) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix drops being refused by a drop target that spans the full width of its interaction.

  `closestCornersWithInventoryPriority` — the default collision algorithm for slotted drag-drop — ranks zones by **average corner distance**, which grows with a zone's own dimensions: the corners of a wide target are far from the drag even when the drag sits dead centre in it. The inventory container then won the `distance <= droppableDistance * 1.5` comparison, so the chip animated back to the source set and the response stayed empty.

  A `qti-match-interaction` whose second match set holds a single target hit this every time, because one target renders full-width. That is the item reported in [#145](https://github.com/Citolab/qti-components/issues/145): four image choices and one "The biggest obtuse angle" target that nothing could be dropped into.

  The closest droppable now wins outright when the drop point is inside it, which is size-independent — mirroring the absolute priority the inventory container already had for the same test. Scoped to the closest droppable on purpose: it settles droppable-vs-inventory and never which droppable wins, so overlapping targets (a filled `qti-associable-hotspot` grown over its neighbour, say) stay the corner ranking's business.

## 8.2.0

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

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Keep the test-level outcomes a test document declares.

  Test-level `qti-outcome-declaration` elements register themselves into the test context as they
  connect, by dispatching `qti-register-variable`. They are children of `qti-assessment-test`, so they
  connect — and register — _before_ the test element announces `qti-assessment-test-connected`.

  The test host reset its context on that announcement, which threw every one of those registrations
  away. No test-level outcome could then be read or set: `getOutcome` returned nothing, and
  `qti-set-outcome-value` at test level reported the identifier as unavailable.

  `test-container` now announces a new test document with `qti-testdoc-loaded` at the point it assigns
  it, and the host resets on that instead. Lit's re-render is async, so the reset still lands before
  any child of the new document connects. `qti-assessment-test-connected` keeps its remaining job of
  adding the item-refs, and now preserves what the document registered.

  This also removes a dead guard: the old handler tested `testContext.items.length > 0` immediately
  after assigning the initial context, so the condition could never hold.

### Patch Changes

- [#199](https://github.com/Citolab/qti-components/pull/199) [`9073338`](https://github.com/Citolab/qti-components/commit/9073338d093389485b43449e53043c451e04159a) Thanks [@herrKlein](https://github.com/herrKlein)! - Fix inherited attributes/members/slots/events/csspart metadata silently missing from the generated custom elements manifest and JSX types for components that only inherited an API from a mixin/base class and didn't declare an entry of their own. Caused by a breaking change in `@wc-toolkit/cem-utilities@1.6.0` that `@wc-toolkit/cem-inheritance` relies on; `@wc-toolkit/cem-utilities` is now pinned to `1.2.0` until upstream is fixed ([wc-toolkit/cem-inheritance#30](https://github.com/wc-toolkit/cem-inheritance/issues/30)).

- [`bad7a8a`](https://github.com/Citolab/qti-components/commit/bad7a8a052c009d80c343e828bee99df363c739b) Thanks [@herrKlein](https://github.com/herrKlein)! - Fix the drag-handle grip rendering off-centre on `qti-gap-text` chips and `qti-simple-associable-choice` chips (used by gap-match, associate and match interactions).

  The grip is a theme-drawn `::before` on `::part(control)`, centred with `vertical-align: middle` — a line-box/font-metric alignment, not a geometric one. `qti-gap-text` and `qti-simple-associable-choice` gave their `control` div no layout of its own, so the glyph's position drifted with font/line-height. `[part='control']` now flex-centres its content (`display: flex; align-items: center; justify-content: center`), matching the fix `qti-simple-choice` already had for its own control.

- [#198](https://github.com/Citolab/qti-components/pull/198) [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Resolve test-level outcomes in variable expressions.

  The `variable` expression and `getVariables()` only consulted item scope, so a test-level outcome
  that had just been set — a total summed in outcome processing, say — could not be read back:
  `<qti-variable identifier="TEST_SCORE"/>` resolved to `undefined` and threw once used in a
  comparison.

  Item scope is resolved first, then the test-level outcome variables, mirroring how
  `qti-printed-variable` already does it — and an unresolved identifier now returns `null` instead of
  throwing. This is the pattern the QTI 3.0 spec's own feedback examples rely on: set a total via
  `qti-test-variables`, then branch on it with `qti-variable` in an `outcomeCondition`.

## 8.1.0

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

- [#190](https://github.com/Citolab/qti-components/pull/190) [`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Flatten native CSS nesting in the published stylesheet, and state the browser support floor.

  The theme sources use `&`-nested rules throughout and the postcss pipeline passed them through, so
  `dist/item.css` shipped 283 nested selectors. Safari below 16.5 cannot parse native nesting and
  dropped those rules. `postcss-nesting` now runs after `postcss-mixins` — the mixins can themselves
  emit nesting — leaving none in the built stylesheet.

  `.browserslistrc` gives autoprefixer an explicit floor in place of the implicit `defaults`.
  Safari/iOS 16.4 is the hard minimum, imposed by the unguarded `ElementInternals.attachInternals`
  calls in the interaction base classes.

  The same postcss config feeds the inline-css esbuild plugin, so shadow-DOM component styles get
  both behaviours too.

- [#191](https://github.com/Citolab/qti-components/pull/191) [`3fab714`](https://github.com/Citolab/qti-components/commit/3fab714904293e58e53c0661792f564d84f76bed) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Reject `load()` when the XML fetch fails.

  `qtiTransformTest().load()` and `qtiTransformManifest().load()` wrapped `loadXML` in a `new
Promise` that only ever called `resolve`. When the fetch failed — offline, CORS, a 404 — the
  rejection had no handler, so it escaped as an unhandled rejection and the promise the caller was
  awaiting never settled. A player awaiting `load()` hung there with no error to render and no way
  to retry.

  Both now `await loadXML` directly, so the failure propagates to the caller and an abort still
  surfaces as `AbortError`. Successful loads resolve with the api as before.

## 8.0.2

### Patch Changes

- [`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make the published types usable from outside the workspace, and stop shipping a second copy of Lit.

  - **qti-components**: stop bundling Lit into the npm build. `noExternal` included `lit`, while `package.json` also declared it a dependency, so a consumer received the bundled copy _and_ installed one — and anything with its own Lit components ran two. Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them), two `@lit/context` registries, and lit's "Multiple versions of Lit loaded" warning, which counts registered instances rather than comparing versions. `lit`, `lit-html`, `lit-element` and `@lit/*` are now external for the npm build; the CDN builds still bundle everything, as they must.
  - **qti-components**: emit self-contained declarations. `dts: { resolve: true }` only inlines types behind bare specifiers, so the ~20 deep subpath imports of `@qti-components/*` — devDependencies, deliberately not published — stayed in the output. The runtime worked while the types were unresolvable, and consumers had to install those devDependencies by hand to type-check at all. The declaration build now resolves each specifier to the sibling package's built `.d.ts`; nothing but real runtime dependencies (`lit`, `@heximal/templates`) is left external.
  - **qti-components**: accept a React ref. The generated JSX types declared `ref` as the element or a callback taking it, which is right for a Lit template and wrong for React — and unfixable downstream, since the generator emits both `declare module "react"` and `declare global`, so a consumer's augmentation merges rather than replaces. `ref` now also accepts a `RefObject`.
  - **qti-item**, **qti-test**: type `itemURL` / `itemDoc` / `itemXML` and `testURL` / `testDoc` / `testXML` as `| null`. All six initialise to `null` while declaring a non-null type, which compiled only because the workspace builds without `strictNullChecks`. Consumers on `strict` were unable to pass the `null` these properties already hold — note that they now have to handle it.
  - **base**, **interactions-core**, **inline-choice-interaction**: take `PropertyValues` rather than `PropertyValues<this>` in `firstUpdated`, `willUpdate` and `updated`. The polymorphic `this` narrowed the parameter per subclass, which made every interaction structurally incompatible with `LitElement` — so `Constructor<LitElement>`, the standard constraint for a Lit mixin, rejected all of them and a consumer could not wrap an interaction in a mixin without casting.
  - **qti-test**: describe what `TestNavigationMixin` actually adds. Its interface placeholder was an empty `declare class`, so the returned `Constructor<…> & T` contributed nothing and `navigate`, `requestTimeout`, `postLoadTransformCallback`, `postLoadTestTransformCallback` and `navigateTo` were all erased from `QtiTest`'s public type — consumers had to intersect the class with `IQtiTest` by hand to describe one element. `ITestNavigationMixin` now carries them, plus the previously undeclared `getLoadingProgress`, and the mixin class `implements` it so the two cannot drift apart.
  - **qti-test**: drop `showLoadingIndicators` and `retryNavigation` from `ITestNavigationMixin`, and so from `IQtiTest`. Nothing implemented either — they existed only in the interface, and `retryNavigation()` would have thrown. No runtime behaviour changes, but code that referenced them in a type position will no longer compile.

## 8.0.1

### Patch Changes

- [`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - - **qti-components**: give `./react` a real `default` condition next to its `types`, and emit the matching `dist/qti-components-jsx.js` stub during `cem:react-types`, so bundlers and `attw` can resolve the subpath instead of only type-resolving it.
  - **qti-components**: build `.d.ts` with `dts: { resolve: true }` and raise the tsup heap to 8 GB, so declarations that reference workspace types resolve instead of failing the build.
  - **qti-theme**: reorganize the CSS layers — move item structure into `styles/item-structure.css`, and restructure the native, prose, states and interaction (corrections, prompt, slider, position-object) stylesheets around it.
  - **qti-test**: export `qti-outcome-processing` and `qti-test-variables` from the components barrel; they were shipped but not reachable from the package entry.
  - **text-entry-interaction**: correct the `@csspart` documentation — document `answer` and `message`, and drop the `correct` part that no longer exists.

## 8.0.0

### Major Changes

BREAKING: the umbrella republished on top of the workspace's breaking batch. The umbrella bundles every `@qti-components/*` package into its own `dist`, so their breaking changes are breaking here.

#### Drop sizing and drag-and-drop internals

`interactions-core`, `theme`, `base`, `order-interaction`, `match-interaction`

- A drop is now either a **measured slot** or a **flat-floor card**, decided per interaction rather than per drop. Order's drops size from their chips instead of stretching to a grid track.
- **Six CSS custom properties removed:**

  | removed                        | use instead                                       |
  | ------------------------------ | ------------------------------------------------- |
  | `--qti-drop-min-height`        | `--qti-dropzone-min-height`                       |
  | `--qti-drop-min-width`         | `--qti-dropzone-min-width`                        |
  | `--qti-match-target-min-width` | `--qti-dropzone-min-width` (fallback `150px`)     |
  | `--qti-drop-gap`               | declare `gap` on your own `::part(drop)` rule     |
  | `--qti-dropzone-padding`       | declare `padding` on your own `::part(drop)` rule |
  | `--qti-form-size`              | `--qti-control-size`                              |

- The `qti-droppable` **attribute is gone**; drop targets carry the custom state `:state(droppable)` only. Migrate `[qti-droppable]` and `:state(drop)` → `:state(droppable)`.
- New exports from `interactions-core`: `DropzoneAutoSizeMixin`, `MenuAutoSizeMixin`. Both re-measure on resize and mutation, so a late-loading image no longer leaves a drop the wrong size.
- `DragDropSlottedMixin`'s unreachable `configuration` object is removed, and `applyDropzoneAutoSizing`'s trailing `hostWindow` parameter moved into `options`.

See `packages/qti-theme/DROP-SIZING.md` for the full model.

#### `qti-match-interaction` tabular mode

The `<table>` / `<tr>` / `<td>` scaffolding is replaced by a CSS grid with subgrid wrappers, sharing its shadow structure with the editor's tabular implementation. Input cells are now `<label>`-wrapped, so clicking anywhere on a cell toggles it.

- `::part(table)` → `::part(grid)`
- `::part(row)` → `::part(input-cell)` (or drop it; rows are no longer a styled boundary)
- `::part(checkmark)` is gone — the checkmark is drawn by the `check-checkbox-checked` mask
- `--qti-match-rows` / `--qti-match-cols` are now written on the inner `[part='grid']`, not on the host

#### `qti-inline-choice-interaction`

The open control renders as one shape, and autosizing measures option rows rather than the menu — fixing a control that grew by one chevron on every open, and one that came out ~60px too wide. The measured width is written on `::part(trigger)`, not the host. The anchor is renamed `--qti-inline-choice-trigger` → `--qti-inline-choice-anchor`. Consumer CSS reaching into the old trigger/menu structure needs revisiting.

Four component-local custom properties removed in favour of shared tokens: `--qti-inline-choice-overlay-z-index` → `--qti-overlay-z-index`, `--qti-inline-choice-popover-z-index` → `--qti-popover-z-index`, `--qti-inline-choice-motion-duration-fast` → `--qti-motion-duration-fast`, `--qti-inline-choice-trigger-gap` → `--qti-glyph-gap`.

#### `item.css`

Ships from `@qti-components/theme` 2.0.0, which carries the removed custom properties and the retargeted parts above.

### Minor Changes

- **Portable custom interactions** now receive `responseDeclaration` and `status` in their `getInstance` configuration, so a PCI can render the correct response itself instead of having it pushed in as a candidate response. `correctResponse` is only sent when `status` is `solution` or `review`. Implements the design agreed in [1EdTech/qti-project-management#210](https://github.com/1EdTech/qti-project-management/issues/210).
- **The theme covers editor documents.** `reset.css` is scoped to `.ProseMirror` as well as `qti-item-body`, and a new `prose.css` gives plain author markup (tables, lists, headings, rules) a look.
- **Shared `correct-response` codec** extracted into `@qti-components/base` (`parseCorrectResponseAttribute` / `serializeCorrectResponseAttribute` and value-shape helpers), so the runtime and downstream editors cannot drift.
- `::part(drag)` selectors added for associate, match, order, gap-match and graphic-gap-match, letting host applications style a placed fake-drag element with the same declarations as runtime drags.

### Patch Changes

- **The drag clone stays visible in fullscreen.** `createDragClone` now resolves its host instead of assuming the interaction's root, and corrects for a containing block that establishes a new coordinate space for `position: fixed` children.
- **A placed chip can shrink to its drop**, so it is the same box in the bank and in the drop when the bank is narrower than the chip's label (`flex: 0 0 auto` → `0 1 auto`).
- **PCI show-correct-response repaired** — the correction viewer no longer clones the live iframe or relies on an instance-level `connectedCallback`, and no longer duplicates the original's `id`.
- **Inline-choice answers the internal correct-response mode with the full variant**, matching text-entry, instead of painting a competing `part="correct-option"` marker that blanked the candidate's answer. The withholding rule is now an overridable `withholdsFullCorrectResponseWhenCorrect` hook.
- **The PCI iframe is built with `srcdoc`** instead of a `blob:` object URL, so a player serving package resources through a Service Worker sees the interaction's requests. `<base href>` now points at `data-base-url` rather than the site origin.
- `::part(drag)` selectors no longer silently drop in Chrome — an in-list CSS comment made Chrome's nesting parser discard the selector that followed it.

### Vocabulary

Three non-spec `qti-`-prefixed presentation classes removed — `qti-layout-offset12`, `qti-choices-stacking-6`, `qti-input-width-5` — and two internally-minted ones moved to the `cito-` prefix: `qti-dialog` → `cito-dialog`, and `qti-graphic-order-marker` → `cito-graphic-order-marker`. The last is applied to light-DOM children, so **any downstream stylesheet targeting `.qti-graphic-order-marker` must be updated**. The `qti-` prefix is reserved by 1EdTech for standardized vocabulary maintained outside the schema, so minting names inside it risks a silent collision.
