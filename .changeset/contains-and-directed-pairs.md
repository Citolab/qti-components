---
'@qti-components/processing': minor
'@qti-components/base': minor
'@citolab/qti-components': minor
---

Complete `qti-contains`, and with it fix how every operator compares a directed pair.

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
