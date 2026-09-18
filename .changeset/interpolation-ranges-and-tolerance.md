---
'@qti-components/processing': minor
'@qti-components/elements': minor
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

**Interpolation tables now match on ranges, which changes existing scores.** An entry's
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
