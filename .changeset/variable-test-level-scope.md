---
'@qti-components/base': patch
'@qti-components/processing': patch
'@citolab/qti-components': patch
---

Resolve test-level outcomes in variable expressions.

The `variable` expression and `getVariables()` only consulted item scope, so a test-level outcome
that had just been set — a total summed in outcome processing, say — could not be read back:
`<qti-variable identifier="TEST_SCORE"/>` resolved to `undefined` and threw once used in a
comparison.

Item scope is resolved first, then the test-level outcome variables, mirroring how
`qti-printed-variable` already does it — and an unresolved identifier now returns `null` instead of
throwing. This is the pattern the QTI 3.0 spec's own feedback examples rely on: set a total via
`qti-test-variables`, then branch on it with `qti-variable` in an `outcomeCondition`.
