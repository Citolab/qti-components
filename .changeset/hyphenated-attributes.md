---
'@qti-components/processing': patch
'@qti-components/elements': patch
'@citolab/qti-components': patch
---

Read two QTI attributes that never reached their properties.

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
