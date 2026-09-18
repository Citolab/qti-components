---
'@qti-components/base': minor
'@qti-components/processing': patch
'@citolab/qti-components': minor
---

**Expression results no longer claim to be integers, which changes comparisons.** Elements reached
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
