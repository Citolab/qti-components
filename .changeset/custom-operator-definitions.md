---
'@qti-components/elements': minor
'@qti-components/base': minor
'@citolab/qti-components': minor
---

Support `<qti-custom-operator definition="…">`, the way items authored against the Citolab QTI
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
