---
'@qti-components/base': minor
'@qti-components/processing': minor
'@citolab/qti-components': minor
---

Let an operator declare the base type its result always has, instead of guessing it from the value.

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
